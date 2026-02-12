use anyhow::Result;
use chrono::{DateTime, Duration, NaiveDate, NaiveDateTime, Utc};
use owo_colors::OwoColorize;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::utils::{color_stage, color_vote, format_number, humanize};

pub async fn run_poll_stats(
    pool: &PgPool,
    days: i32,
    channel_id: Option<Uuid>,
    poll_id: Option<Uuid>,
    top_polls: u32,
    top_channels: u32,
) -> Result<()> {
    let since = Utc::now() - Duration::days(days as i64);
    println!(
        "\n{} {}",
        "Poll Stats".bold().underline(),
        format!("(last {} days, since {})", days, since.format("%Y-%m-%d")).dimmed()
    );

    // ── Poll type breakdown ──────────────────────────────────────────

    let poll_type_counts: Vec<PollTypeCount> = sqlx::query_as(
        r#"
        SELECT COALESCE("pollType", 'poll')::text AS poll_type,
               COUNT(*)::bigint AS count
        FROM poll
        WHERE "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
          AND ($2::uuid IS NULL OR "channelId" = $2)
          AND ($3::uuid IS NULL OR id = $3)
        GROUP BY "pollType"
        ORDER BY count DESC
        "#,
    )
    .bind(days)
    .bind(channel_id)
    .bind(poll_id)
    .fetch_all(pool)
    .await?;

    let total_polls: i64 = poll_type_counts.iter().map(|r| r.count).sum();
    println!(
        "{} {} polls created",
        "•".cyan(),
        format_number(total_polls).bold()
    );

    for PollTypeCount { poll_type, count } in &poll_type_counts {
        let pct = if total_polls > 0 {
            (*count as f64 / total_polls as f64) * 100.0
        } else {
            0.0
        };
        println!(
            "  {} {:<10} {:>6} ({:>5.1}%)",
            "→".dimmed(),
            poll_type.bold(),
            count.to_string().bold(),
            pct
        );
    }

    // ── Proposal stage distribution ──────────────────────────────────

    let stage_counts: Vec<StageCount> = sqlx::query_as(
        r#"
        SELECT stage::text AS stage, COUNT(*)::bigint AS count
        FROM poll
        WHERE "pollType" = 'proposal'
          AND "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
          AND ($2::uuid IS NULL OR "channelId" = $2)
          AND ($3::uuid IS NULL OR id = $3)
        GROUP BY stage
        ORDER BY count DESC
        "#,
    )
    .bind(days)
    .bind(channel_id)
    .bind(poll_id)
    .fetch_all(pool)
    .await?;

    let total_proposals: i64 = stage_counts.iter().map(|r| r.count).sum();
    if !stage_counts.is_empty() {
        println!("\n{}", "Proposal Stages".bold());
        for StageCount { stage, count } in &stage_counts {
            let pct = if total_proposals > 0 {
                (*count as f64 / total_proposals as f64) * 100.0
            } else {
                0.0
            };
            println!(
                "  {} {:<10} {:>6} ({:>5.1}%)",
                "→".dimmed(),
                color_stage(stage),
                count.to_string().bold(),
                pct
            );
        }
    }

    // ── Vote stats ───────────────────────────────────────────────────

    let total_votes: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)::bigint
        FROM vote v
        JOIN poll p ON p.id = v."pollId"
        WHERE v."createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
          AND ($2::uuid IS NULL OR p."channelId" = $2)
          AND ($3::uuid IS NULL OR p.id = $3)
        "#,
    )
    .bind(days)
    .bind(channel_id)
    .bind(poll_id)
    .fetch_one(pool)
    .await?;

    let unique_voters: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(DISTINCT v."userId")::bigint
        FROM vote v
        JOIN poll p ON p.id = v."pollId"
        WHERE v."createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
          AND ($2::uuid IS NULL OR p."channelId" = $2)
          AND ($3::uuid IS NULL OR p.id = $3)
        "#,
    )
    .bind(days)
    .bind(channel_id)
    .bind(poll_id)
    .fetch_one(pool)
    .await?;

    println!(
        "\n{}\n{} {} votes captured\n{} {} unique voters",
        "Votes".bold(),
        "•".cyan(),
        format_number(total_votes).bold(),
        "•".cyan(),
        format_number(unique_voters).bold()
    );

    let vote_mix: Vec<VoteTypeCount> = sqlx::query_as(
        r#"
        SELECT v."voteType"::text AS vote_type,
               COUNT(*)::bigint AS count
        FROM vote v
        JOIN poll p ON p.id = v."pollId"
        WHERE v."createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
          AND ($2::uuid IS NULL OR p."channelId" = $2)
          AND ($3::uuid IS NULL OR p.id = $3)
        GROUP BY v."voteType"
        ORDER BY count DESC
        "#,
    )
    .bind(days)
    .bind(channel_id)
    .bind(poll_id)
    .fetch_all(pool)
    .await?;

    if !vote_mix.is_empty() {
        for VoteTypeCount { vote_type, count } in &vote_mix {
            let pct = if total_votes > 0 {
                (*count as f64 / total_votes as f64) * 100.0
            } else {
                0.0
            };
            let label = vote_type.as_deref().unwrap_or("unknown");
            println!(
                "  {} {:<9} {:>6} ({:>5.1}%)",
                "→".dimmed(),
                color_vote(label),
                count.to_string().bold(),
                pct
            );
        }
    }

    let avg_votes: Option<f64> = sqlx::query_scalar(
        r#"
        WITH vote_counts AS (
            SELECT p.id, COUNT(v.id)::bigint AS votes
            FROM poll p
            LEFT JOIN vote v ON v."pollId" = p.id
            WHERE p."createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
              AND ($2::uuid IS NULL OR p."channelId" = $2)
              AND ($3::uuid IS NULL OR p.id = $3)
            GROUP BY p.id
        )
        SELECT AVG(votes)::float FROM vote_counts
        "#,
    )
    .bind(days)
    .bind(channel_id)
    .bind(poll_id)
    .fetch_optional(pool)
    .await?;

    if let Some(avg) = avg_votes {
        println!(
            "{} avg votes per poll",
            format!("{:.1}", avg).green().bold()
        );
    }

    // ── Recent creation trend ────────────────────────────────────────

    let daily_counts: Vec<DailyCount> = sqlx::query_as(
        r#"
        SELECT DATE_TRUNC('day', "createdAt")::date AS day,
               COUNT(*)::bigint AS count
        FROM poll
        WHERE "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
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

    // ── Most active polls ────────────────────────────────────────────

    if poll_id.is_none() && top_polls > 0 {
        let poll_participation: Vec<PollParticipation> = sqlx::query_as(
            r#"
            SELECT p.id AS poll_id,
                   p."channelId" AS channel_id,
                   COUNT(v.id)::bigint AS votes,
                   MAX(v."createdAt") AS last_vote_at
            FROM poll p
            LEFT JOIN vote v ON v."pollId" = p.id
            WHERE p."createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
              AND ($2::uuid IS NULL OR p."channelId" = $2)
            GROUP BY p.id
            ORDER BY votes DESC, last_vote_at DESC NULLS LAST
            LIMIT $3::int
            "#,
        )
        .bind(days)
        .bind(channel_id)
        .bind(top_polls as i32)
        .fetch_all(pool)
        .await?;

        if !poll_participation.is_empty() {
            println!("\n{}", "Most Active Polls".bold());
            for PollParticipation {
                poll_id,
                channel_id,
                votes,
                last_vote_at,
            } in poll_participation
            {
                let freshness = last_vote_at
                    .map(|ts| {
                        let ts_utc = DateTime::from_naive_utc_and_offset(ts, Utc);
                        format!("last vote {}", humanize(ts_utc))
                    })
                    .unwrap_or_else(|| "no votes yet".into());
                println!(
                    "{} poll {} (channel {}) — {} votes, {}",
                    "•".cyan(),
                    poll_id,
                    channel_id,
                    votes.to_string().bold(),
                    freshness.dimmed()
                );
            }
        }
    }

    // ── Top channels ─────────────────────────────────────────────────

    if top_channels > 0 {
        let channel_counts: Vec<ChannelCount> = sqlx::query_as(
            r#"
            SELECT "channelId" AS channel_id, COUNT(*)::bigint AS count
            FROM poll
            WHERE "createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
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
                    "{} {} ({} polls)",
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
struct PollTypeCount {
    poll_type: String,
    count: i64,
}

#[derive(Debug, FromRow)]
struct StageCount {
    stage: String,
    count: i64,
}

#[derive(Debug, FromRow)]
struct VoteTypeCount {
    vote_type: Option<String>,
    count: i64,
}

#[derive(Debug, FromRow)]
struct DailyCount {
    day: NaiveDate,
    count: i64,
}

#[derive(Debug, FromRow)]
struct PollParticipation {
    poll_id: Uuid,
    channel_id: Uuid,
    votes: i64,
    last_vote_at: Option<NaiveDateTime>,
}

#[derive(Debug, FromRow)]
struct ChannelCount {
    channel_id: Uuid,
    count: i64,
}
