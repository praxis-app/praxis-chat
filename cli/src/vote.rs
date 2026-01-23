use anyhow::Result;
use chrono::{DateTime, Duration, NaiveDateTime, Utc};
use owo_colors::OwoColorize;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::utils::{color_vote, format_number, humanize};

pub async fn run_vote_stats(
    pool: &PgPool,
    days: i32,
    channel_id: Option<Uuid>,
    poll_id: Option<Uuid>,
    top_polls: u32,
) -> Result<()> {
    let since = Utc::now() - Duration::days(days as i64);
    println!(
        "\n{} {}",
        "Vote Stats".bold().underline(),
        format!("(last {} days, since {})", days, since.format("%Y-%m-%d")).dimmed()
    );

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

    println!(
        "{} {} votes captured",
        "•".cyan(),
        format_number(total_votes).bold()
    );

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
        "{} {} unique voters",
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
        println!("\n{}", "Vote Mix".bold());
        for VoteTypeCount { vote_type, count } in vote_mix {
            let pct = if total_votes > 0 {
                (count as f64 / total_votes as f64) * 100.0
            } else {
                0.0
            };
            println!(
                "  {} {:<9} {:>6} ({:>5.1}%)",
                "→".dimmed(),
                color_vote(&vote_type),
                count.to_string().bold(),
                pct
            );
        }
    }

    if poll_id.is_none() && top_polls > 0 {
        let poll_participation: Vec<PollParticipation> = sqlx::query_as(
            r#"
            SELECT p.id AS poll_id,
                   p."channelId" AS channel_id,
                   COUNT(v.id)::bigint AS votes,
                   MAX(v."createdAt") AS last_vote_at
            FROM poll p
            LEFT JOIN vote v ON v."pollId" = p.id
            WHERE p."pollType" = 'proposal'
              AND p."createdAt" >= NOW() - ($1::int * INTERVAL '1 day')
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

    Ok(())
}

#[derive(Debug, FromRow)]
struct VoteTypeCount {
    vote_type: String,
    count: i64,
}

#[derive(Debug, FromRow)]
struct PollParticipation {
    poll_id: Uuid,
    channel_id: Uuid,
    votes: i64,
    last_vote_at: Option<NaiveDateTime>,
}
