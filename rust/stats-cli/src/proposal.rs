use anyhow::Result;
use chrono::{Duration, NaiveDate, Utc};
use owo_colors::OwoColorize;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::utils::{color_stage, format_number};

pub async fn run_proposal_funnel(
    pool: &PgPool,
    days: i32,
    channel_id: Option<Uuid>,
    top_channels: u32,
) -> Result<()> {
    let since = Utc::now() - Duration::days(days as i64);
    println!(
        "\n{} {}",
        "Proposal Funnel".bold().underline(),
        format!("(last {} days, since {})", days, since.format("%Y-%m-%d")).dimmed()
    );

    let total: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)::bigint
        FROM poll
        WHERE "pollType" = 'proposal'
          AND "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
          AND ($2::uuid IS NULL OR "channelId" = $2)
        "#,
    )
    .bind(days)
    .bind(channel_id)
    .fetch_one(pool)
    .await?;

    println!(
        "{} {} proposals created",
        "•".cyan(),
        format_number(total).bold()
    );

    let stage_counts: Vec<StageCount> = sqlx::query_as(
        r#"
        SELECT stage::text AS stage, COUNT(*)::bigint AS count
        FROM poll
        WHERE "pollType" = 'proposal'
          AND "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
          AND ($2::uuid IS NULL OR "channelId" = $2)
        GROUP BY stage
        ORDER BY count DESC
        "#,
    )
    .bind(days)
    .bind(channel_id)
    .fetch_all(pool)
    .await?;

    for StageCount { stage, count } in stage_counts {
        let colorized_stage = color_stage(&stage);
        let pct = if total > 0 {
            (count as f64 / total as f64) * 100.0
        } else {
            0.0
        };
        println!(
            "  {} {:<10} {:>6} ({:>5.1}%)",
            "→".dimmed(),
            colorized_stage,
            count.to_string().bold(),
            pct
        );
    }

    let avg_votes: Option<f64> = sqlx::query_scalar(
        r#"
        WITH vote_counts AS (
            SELECT p.id, COUNT(v.id)::bigint AS votes
            FROM poll p
            LEFT JOIN vote v ON v."pollId" = p.id
            WHERE p."pollType" = 'proposal'
              AND p."createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
              AND ($2::uuid IS NULL OR p."channelId" = $2)
            GROUP BY p.id
        )
        SELECT AVG(votes)::float FROM vote_counts
        "#,
    )
    .bind(days)
    .bind(channel_id)
    .fetch_optional(pool)
    .await?;

    if let Some(avg) = avg_votes {
        println!(
            "{} avg votes per proposal",
            format!("{:.1}", avg).green().bold()
        );
    }

    let daily_counts: Vec<DailyCount> = sqlx::query_as(
        r#"
        SELECT DATE_TRUNC('day', "createdAt")::date AS day,
               COUNT(*)::bigint AS count
        FROM poll
        WHERE "pollType" = 'proposal'
          AND "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
          AND ($2::uuid IS NULL OR "channelId" = $2)
        GROUP BY day
        ORDER BY day DESC
        LIMIT 14
        "#,
    )
    .bind(days)
    .bind(channel_id)
    .fetch_all(pool)
    .await?;

    if !daily_counts.is_empty() {
        println!("\n{}", "Recent Creation Trend".bold());
        for DailyCount { day, count } in daily_counts.iter().rev() {
            let bar = "▇".repeat((*count).clamp(0, 25) as usize);
            println!(
                "{} {:>4} {}",
                day.format("%b %d").to_string().dimmed(),
                count,
                bar.blue()
            );
        }
    }

    if top_channels > 0 {
        let channel_counts: Vec<ChannelCount> = sqlx::query_as(
            r#"
            SELECT "channelId" AS channel_id, COUNT(*)::bigint AS count
            FROM poll
            WHERE "pollType" = 'proposal'
              AND "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
              AND ($2::uuid IS NULL OR "channelId" = $2)
            GROUP BY "channelId"
            ORDER BY count DESC
            LIMIT $3::int
            "#,
        )
        .bind(days)
        .bind(channel_id)
        .bind(top_channels as i32)
        .fetch_all(pool)
        .await?;

        if !channel_counts.is_empty() {
            println!("\n{}", "Top Channels".bold());
            for ChannelCount { channel_id, count } in channel_counts {
                println!(
                    "{} {} ({} proposals)",
                    "•".cyan(),
                    channel_id,
                    count.to_string().bold()
                );
            }
        }
    }

    Ok(())
}

#[derive(Debug, FromRow)]
struct StageCount {
    stage: String,
    count: i64,
}

#[derive(Debug, FromRow)]
struct DailyCount {
    day: NaiveDate,
    count: i64,
}

#[derive(Debug, FromRow)]
struct ChannelCount {
    channel_id: Uuid,
    count: i64,
}
