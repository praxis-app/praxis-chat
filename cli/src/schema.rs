use std::io::IsTerminal;

use anyhow::Result;
use owo_colors::OwoColorize;
use sqlx::{FromRow, PgPool};

use crate::utils::{print_header, print_section_label};

pub async fn run_schema(pool: &PgPool) -> Result<()> {
    let color = std::io::stdout().is_terminal();

    if color {
        println!("\n{}", "Database Schema".bold().underline());
    } else {
        println!("\nDatabase Schema");
    }

    print_enums(pool, color).await?;
    print_tables(pool, color).await?;

    Ok(())
}

async fn print_enums(pool: &PgPool, color: bool) -> Result<()> {
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
        print_header("Enums", color);
        for EnumInfo { name, values } in enums {
            if color {
                println!(
                    "  {} {} = {{ {} }}",
                    "•".cyan(),
                    name.yellow(),
                    values.join(", ")
                );
            } else {
                println!("  - {} = {{ {} }}", name, values.join(", "));
            }
        }
    }

    Ok(())
}

async fn print_tables(pool: &PgPool, color: bool) -> Result<()> {
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
        if color {
            println!("\n{} {}", "Table:".bold(), name.green().bold());
        } else {
            println!("\nTable: {}", name);
        }

        print_columns(pool, &name, color).await?;
        print_indexes(pool, &name, color).await?;
        print_constraints(pool, &name, color).await?;
    }

    Ok(())
}

async fn print_columns(pool: &PgPool, table_name: &str, color: bool) -> Result<()> {
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

    print_section_label("Columns:", color);

    for ColumnInfo {
        name,
        data_type,
        nullable,
        default_value,
    } in columns
    {
        let null_marker = if nullable == "YES" { "?" } else { "" };
        let default_str = default_value
            .map(|d| format!(" = {}", d))
            .unwrap_or_default();

        if color {
            println!(
                "    {} {:<30} {}{}{}",
                "→".dimmed(),
                name,
                data_type.cyan(),
                null_marker.yellow(),
                default_str.dimmed()
            );
        } else {
            println!(
                "    - {:<30} {}{}{}",
                name, data_type, null_marker, default_str
            );
        }
    }

    Ok(())
}

async fn print_indexes(pool: &PgPool, table_name: &str, color: bool) -> Result<()> {
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
        print_section_label("Indexes:", color);

        for IndexInfo { name, definition } in indexes {
            let is_unique = definition.to_lowercase().contains("unique");
            let is_primary = name.ends_with("_pkey") || name.contains("PK_");
            let marker = if is_primary {
                "PK"
            } else if is_unique {
                "UQ"
            } else {
                "IX"
            };

            let cols = extract_index_columns(&definition);

            if color {
                let colored_marker = match marker {
                    "PK" => marker.magenta().bold().to_string(),
                    "UQ" => marker.blue().bold().to_string(),
                    _ => marker.dimmed().to_string(),
                };
                println!(
                    "    {} [{}] {} ({})",
                    "→".dimmed(),
                    colored_marker,
                    name,
                    cols
                );
            } else {
                println!("    - [{}] {} ({})", marker, name, cols);
            }
        }
    }

    Ok(())
}

async fn print_constraints(pool: &PgPool, table_name: &str, color: bool) -> Result<()> {
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
        print_section_label("Constraints:", color);

        for ConstraintInfo {
            name,
            constraint_type,
            definition,
        } in constraints
        {
            let marker = match constraint_type.as_str() {
                "FOREIGN KEY" => "FK",
                "CHECK" => "CK",
                "EXCLUDE" => "EX",
                _ => &constraint_type,
            };

            if color {
                let colored_marker = match marker {
                    "FK" => marker.yellow().bold().to_string(),
                    "CK" => marker.cyan().bold().to_string(),
                    "EX" => marker.red().bold().to_string(),
                    _ => marker.dimmed().to_string(),
                };
                println!(
                    "    {} [{}] {} {}",
                    "→".dimmed(),
                    colored_marker,
                    name,
                    definition.dimmed()
                );
            } else {
                println!("    - [{}] {} {}", marker, name, definition);
            }
        }
    }

    Ok(())
}

fn extract_index_columns(definition: &str) -> String {
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
