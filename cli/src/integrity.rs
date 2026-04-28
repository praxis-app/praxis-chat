use std::collections::HashSet;
use std::path::Path;

use anyhow::Result;
use owo_colors::OwoColorize;
use sqlx::{FromRow, PgPool};

pub async fn run_integrity_check(pool: &PgPool, content_path: &Path) -> Result<()> {
    println!("\n{}", "Integrity Check".bold().underline());

    let mut total_anomalies: i64 = 0;

    total_anomalies += check_orphaned_images(pool).await?;
    total_anomalies += check_orphaned_image_files(pool, content_path).await?;
    total_anomalies += check_polls_missing_config(pool).await?;
    total_anomalies += check_polls_missing_action(pool).await?;
    total_anomalies += check_impossible_vote_states(pool).await?;
    total_anomalies += check_messages_without_author(pool).await?;
    total_anomalies += check_votes_without_poll(pool).await?;
    total_anomalies += check_images_without_file(pool).await?;

    // ── Summary ───────────────────────────────────────────────────────
    println!();
    if total_anomalies == 0 {
        println!(
            "{} {}",
            "Result:".bold(),
            "No anomalies found".green().bold()
        );
    } else {
        println!(
            "{} {} {}",
            "Result:".bold(),
            total_anomalies.to_string().red().bold(),
            "anomaly(ies) found".red()
        );
    }

    Ok(())
}

/// Images where all ownership FKs (messageId, pollId, userId) are NULL
async fn check_orphaned_images(pool: &PgPool) -> Result<i64> {
    let row: AnomalyCount = sqlx::query_as(
        r#"
        SELECT COUNT(*)::bigint AS count
        FROM image
        WHERE "messageId" IS NULL
          AND "pollId" IS NULL
          AND "userId" IS NULL
        "#,
    )
    .fetch_one(pool)
    .await?;

    print_check("Orphaned images (no owner)", row.count);
    Ok(row.count)
}

/// Files in the content directory that have no matching image row in the database
async fn check_orphaned_image_files(pool: &PgPool, content_path: &Path) -> Result<i64> {
    if !content_path.is_dir() {
        print_check(
            "Orphaned image files (no DB row)",
            0,
        );
        return Ok(0);
    }

    let db_filenames: HashSet<String> = sqlx::query_scalar::<_, String>(
        r#"SELECT filename FROM image WHERE filename IS NOT NULL"#,
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .collect();

    let mut orphaned_count: i64 = 0;
    for entry in std::fs::read_dir(content_path)? {
        let entry = entry?;
        let file_name = entry.file_name().to_string_lossy().to_string();

        // Skip non-image files like README.md
        if !file_name.ends_with(".jpeg")
            && !file_name.ends_with(".jpg")
            && !file_name.ends_with(".png")
            && !file_name.ends_with(".gif")
            && !file_name.ends_with(".webp")
        {
            continue;
        }

        if !db_filenames.contains(&file_name) {
            orphaned_count += 1;
        }
    }

    print_check("Orphaned image files (no DB row)", orphaned_count);
    Ok(orphaned_count)
}

/// Polls that have no matching poll_config row
async fn check_polls_missing_config(pool: &PgPool) -> Result<i64> {
    let row: AnomalyCount = sqlx::query_as(
        r#"
        SELECT COUNT(*)::bigint AS count
        FROM poll p
        LEFT JOIN poll_config pc ON pc."pollId" = p.id
        WHERE pc.id IS NULL
        "#,
    )
    .fetch_one(pool)
    .await?;

    print_check("Polls missing config", row.count);
    Ok(row.count)
}

/// Proposals (pollType = 'proposal') that have no matching poll_action row
async fn check_polls_missing_action(pool: &PgPool) -> Result<i64> {
    let row: AnomalyCount = sqlx::query_as(
        r#"
        SELECT COUNT(*)::bigint AS count
        FROM poll p
        LEFT JOIN poll_action pa ON pa."pollId" = p.id
        WHERE p."pollType" = 'proposal'
          AND pa.id IS NULL
        "#,
    )
    .fetch_one(pool)
    .await?;

    print_check("Proposals missing action", row.count);
    Ok(row.count)
}

/// Votes that violate the unique (pollId, userId) constraint at the data level,
/// i.e. duplicate votes by the same user on the same poll
async fn check_impossible_vote_states(pool: &PgPool) -> Result<i64> {
    let row: AnomalyCount = sqlx::query_as(
        r#"
        SELECT COUNT(*)::bigint AS count
        FROM (
            SELECT "pollId", "userId"
            FROM vote
            WHERE "pollId" IS NOT NULL
            GROUP BY "pollId", "userId"
            HAVING COUNT(*) > 1
        ) dupes
        "#,
    )
    .fetch_one(pool)
    .await?;

    print_check("Duplicate votes (same user + poll)", row.count);
    Ok(row.count)
}

/// Messages where both userId and botId are NULL (no author)
async fn check_messages_without_author(pool: &PgPool) -> Result<i64> {
    let row: AnomalyCount = sqlx::query_as(
        r#"
        SELECT COUNT(*)::bigint AS count
        FROM message
        WHERE "userId" IS NULL
          AND "botId" IS NULL
        "#,
    )
    .fetch_one(pool)
    .await?;

    print_check("Messages without author", row.count);
    Ok(row.count)
}

/// Votes where pollId is NULL (should always reference a poll)
async fn check_votes_without_poll(pool: &PgPool) -> Result<i64> {
    let row: AnomalyCount = sqlx::query_as(
        r#"
        SELECT COUNT(*)::bigint AS count
        FROM vote
        WHERE "pollId" IS NULL
        "#,
    )
    .fetch_one(pool)
    .await?;

    print_check("Votes with no poll reference", row.count);
    Ok(row.count)
}

/// Images that were created but never received a filename (stale placeholders)
async fn check_images_without_file(pool: &PgPool) -> Result<i64> {
    let row: AnomalyCount = sqlx::query_as(
        r#"
        SELECT COUNT(*)::bigint AS count
        FROM image
        WHERE filename IS NULL
          AND "createdAt" < NOW() - INTERVAL '1 hour'
        "#,
    )
    .fetch_one(pool)
    .await?;

    print_check("Stale image placeholders (no filename, >1h old)", row.count);
    Ok(row.count)
}

fn print_check(label: &str, count: i64) {
    let status = if count == 0 {
        "OK".green().bold().to_string()
    } else {
        format!("{} found", count).red().bold().to_string()
    };
    println!("{} {:<55} {}", "•".cyan(), label, status);
}

#[derive(Debug, FromRow)]
struct AnomalyCount {
    count: i64,
}
