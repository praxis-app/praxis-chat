use anyhow::Result;
use owo_colors::OwoColorize;
use sqlx::{FromRow, PgPool};

pub async fn run_schema(pool: &PgPool) -> Result<()> {
    println!("\n{}", "Database Schema".bold().underline());

    print_enums(pool).await?;
    print_tables(pool).await?;

    Ok(())
}

async fn print_enums(pool: &PgPool) -> Result<()> {
    let enums: Vec<EnumInfo> = sqlx::query_as(
        r#"
        SELECT t.typname AS name,
               ARRAY_AGG(e.enumlabel ORDER BY e.enumsortorder) AS values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
        GROUP BY t.typname
        ORDER BY t.typname
        "#,
    )
    .fetch_all(pool)
    .await?;

    if !enums.is_empty() {
        println!("\n{}", "Enums".bold());
        for EnumInfo { name, values } in enums {
            println!(
                "  {} {} = {{ {} }}",
                "•".cyan(),
                name.yellow(),
                values.join(", ")
            );
        }
    }

    Ok(())
}

async fn print_tables(pool: &PgPool) -> Result<()> {
    let tables: Vec<TableInfo> = sqlx::query_as(
        r#"
        SELECT table_name AS name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
        "#,
    )
    .fetch_all(pool)
    .await?;

    for TableInfo { name } in tables {
        println!("\n{} {}", "Table:".bold(), name.green().bold());

        print_columns(pool, &name).await?;
        print_indexes(pool, &name).await?;
        print_constraints(pool, &name).await?;
    }

    Ok(())
}

async fn print_columns(pool: &PgPool, table_name: &str) -> Result<()> {
    let columns: Vec<ColumnInfo> = sqlx::query_as(
        r#"
        SELECT column_name AS name,
               CASE
                   WHEN data_type = 'ARRAY' THEN
                       COALESCE(udt_name, data_type)
                   WHEN data_type = 'USER-DEFINED' THEN
                       udt_name
                   WHEN character_maximum_length IS NOT NULL THEN
                       data_type || '(' || character_maximum_length || ')'
                   WHEN numeric_precision IS NOT NULL AND data_type NOT IN ('integer', 'bigint', 'smallint') THEN
                       data_type || '(' || numeric_precision || ',' || COALESCE(numeric_scale, 0) || ')'
                   ELSE data_type
               END AS data_type,
               is_nullable AS nullable,
               column_default AS default_value
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position
        "#,
    )
    .bind(table_name)
    .fetch_all(pool)
    .await?;

    println!("  {}", "Columns:".dimmed());
    for ColumnInfo {
        name,
        data_type,
        nullable,
        default_value,
    } in columns
    {
        let null_marker = if nullable == "YES" { "?" } else { "" };
        let default_str = default_value
            .map(|d| format!(" = {}", d.dimmed()))
            .unwrap_or_default();
        println!(
            "    {} {:<30} {}{}{}",
            "→".dimmed(),
            name,
            data_type.cyan(),
            null_marker.yellow(),
            default_str
        );
    }

    Ok(())
}

async fn print_indexes(pool: &PgPool, table_name: &str) -> Result<()> {
    let indexes: Vec<IndexInfo> = sqlx::query_as(
        r#"
        SELECT indexname AS name,
               indexdef AS definition
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = $1
        ORDER BY indexname
        "#,
    )
    .bind(table_name)
    .fetch_all(pool)
    .await?;

    if !indexes.is_empty() {
        println!("  {}", "Indexes:".dimmed());
        for IndexInfo { name, definition } in indexes {
            let is_unique = definition.to_lowercase().contains("unique");
            let is_primary = name.ends_with("_pkey") || name.contains("PK_");
            let marker = if is_primary {
                "PK".magenta().bold().to_string()
            } else if is_unique {
                "UQ".blue().bold().to_string()
            } else {
                "IX".dimmed().to_string()
            };

            // Extract column(s) from definition
            let cols = extract_index_columns(&definition);
            println!("    {} [{}] {} ({})", "→".dimmed(), marker, name, cols);
        }
    }

    Ok(())
}

async fn print_constraints(pool: &PgPool, table_name: &str) -> Result<()> {
    let constraints: Vec<ConstraintInfo> = sqlx::query_as(
        r#"
        SELECT
            c.conname AS name,
            CASE c.contype
                WHEN 'p' THEN 'PRIMARY KEY'
                WHEN 'f' THEN 'FOREIGN KEY'
                WHEN 'u' THEN 'UNIQUE'
                WHEN 'c' THEN 'CHECK'
                WHEN 'x' THEN 'EXCLUDE'
            END AS constraint_type,
            pg_get_constraintdef(c.oid) AS definition
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = 'public'
          AND t.relname = $1
          AND c.contype IN ('f', 'c', 'x')
        ORDER BY c.contype, c.conname
        "#,
    )
    .bind(table_name)
    .fetch_all(pool)
    .await?;

    if !constraints.is_empty() {
        println!("  {}", "Constraints:".dimmed());
        for ConstraintInfo {
            name,
            constraint_type,
            definition,
        } in constraints
        {
            let type_marker = match constraint_type.as_str() {
                "FOREIGN KEY" => "FK".yellow().bold().to_string(),
                "CHECK" => "CK".cyan().bold().to_string(),
                "EXCLUDE" => "EX".red().bold().to_string(),
                _ => constraint_type.dimmed().to_string(),
            };
            println!(
                "    {} [{}] {} {}",
                "→".dimmed(),
                type_marker,
                name,
                definition.dimmed()
            );
        }
    }

    Ok(())
}

fn extract_index_columns(definition: &str) -> String {
    // Extract columns from index definition like "CREATE INDEX ... ON table USING btree (col1, col2)"
    if let Some(start) = definition.rfind('(') {
        if let Some(end) = definition.rfind(')') {
            return definition[start + 1..end].to_string();
        }
    }
    "?".to_string()
}

#[derive(Debug, FromRow)]
struct EnumInfo {
    name: String,
    values: Vec<String>,
}

#[derive(Debug, FromRow)]
struct TableInfo {
    name: String,
}

#[derive(Debug, FromRow)]
struct ColumnInfo {
    name: String,
    data_type: String,
    nullable: String,
    default_value: Option<String>,
}

#[derive(Debug, FromRow)]
struct IndexInfo {
    name: String,
    definition: String,
}

#[derive(Debug, FromRow)]
struct ConstraintInfo {
    name: String,
    constraint_type: String,
    definition: String,
}
