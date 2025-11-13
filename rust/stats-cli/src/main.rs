use std::env;

use anyhow::{Context, Result};
use chrono::{DateTime, Duration, NaiveDate, Utc};
use clap::{Parser, Subcommand};
use owo_colors::OwoColorize;
use sqlx::postgres::PgPoolOptions;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

const DEFAULT_MAX_CONNECTIONS: u32 = 5;
const MAX_DAYS: i64 = 365 * 5;

#[derive(Parser, Debug)]
#[command(
    name = "Praxis Stats CLI",
    version,
    about = "Colorful read-only stats for Praxis proposals and votes",
    arg_required_else_help = true
)]
struct Cli {
    /// Lookback window in days for commands that support it
    #[arg(long, global = true, default_value_t = 30)]
    days: i64,
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Summaries of proposal throughput and stage distribution
    ProposalFunnel {
        /// Optional channel to scope results
        #[arg(long)]
        channel_id: Option<Uuid>,
        /// Limit of top channels to display
        #[arg(long, default_value_t = 5)]
        top_channels: u32,
    },
    /// Vote mix, turnout, and engagement stats
    VoteStats {
        /// Optional channel scope
        #[arg(long)]
        channel_id: Option<Uuid>,
        /// Focus on a specific poll ID
        #[arg(long)]
        poll_id: Option<Uuid>,
        /// How many high-participation polls to list (ignored when poll_id is set)
        #[arg(long, default_value_t = 5)]
        top_polls: u32,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    let cli = Cli::parse();

    let database_url = build_database_url_from_env()?;

    let day_window = normalize_window(cli.days);
    let pool = PgPoolOptions::new()
        .max_connections(DEFAULT_MAX_CONNECTIONS)
        .after_connect(|conn, _meta| {
            Box::pin(async move {
                // Guard rail: ensure each pooled connection stays read-only.
                sqlx::query("SET default_transaction_read_only = on;")
                    .execute(conn)
                    .await?;
                Ok(())
            })
        })
        .connect(&database_url)
        .await
        .context("failed to connect to PostgreSQL")?;

    match cli.command {
        Commands::ProposalFunnel {
            channel_id,
            top_channels,
        } => {
            run_proposal_funnel(&pool, day_window, channel_id, top_channels).await?;
        }
        Commands::VoteStats {
            channel_id,
            poll_id,
            top_polls,
        } => {
            run_vote_stats(&pool, day_window, channel_id, poll_id, top_polls).await?;
        }
    }

    Ok(())
}

fn build_database_url_from_env() -> Result<String> {
    let username = env_required("DB_USERNAME")?;
    let password = env_required("DB_PASSWORD")?;
    let schema = env_required("DB_SCHEMA")?;
    let host = env_required("DB_HOST")?;
    let port: u16 = env_required("DB_PORT")?
        .parse()
        .context("DB_PORT must be a valid integer")?;

    Ok(format!(
        "postgres://{}:{}@{}:{}/{}",
        username, password, host, port, schema
    ))
}

fn env_required(key: &str) -> Result<String> {
    env::var(key).with_context(|| format!("{} must be set in the environment", key))
}

async fn run_proposal_funnel(
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

async fn run_vote_stats(
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
        SELECT v."voteType" AS vote_type,
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
                    .map(|ts| format!("last vote {}", humanize(ts)))
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
    last_vote_at: Option<DateTime<Utc>>,
}

fn normalize_window(days: i64) -> i32 {
    days.clamp(1, MAX_DAYS) as i32
}

fn format_number(value: i64) -> String {
    let sign = if value < 0 { "-" } else { "" };
    let mut digits: Vec<char> = value.abs().to_string().chars().collect();
    let mut i = digits.len() as isize - 3;
    while i > 0 {
        digits.insert(i as usize, ',');
        i -= 3;
    }
    format!("{sign}{}", digits.into_iter().collect::<String>())
}

fn color_stage(stage: &str) -> String {
    match stage {
        "voting" => stage.yellow().bold().to_string(),
        "ratified" => stage.green().bold().to_string(),
        "revision" => stage.blue().bold().to_string(),
        "closed" => stage.magenta().bold().to_string(),
        other => other.to_string(),
    }
}

fn color_vote(vote: &str) -> String {
    match vote {
        "agree" => vote.green().bold().to_string(),
        "disagree" => vote.red().bold().to_string(),
        "abstain" => vote.cyan().bold().to_string(),
        "block" => vote.magenta().bold().to_string(),
        other => other.to_string(),
    }
}

fn humanize(ts: DateTime<Utc>) -> String {
    let now = Utc::now();
    let delta = now - ts;
    if delta.num_minutes() < 60 {
        format!("{}m ago", delta.num_minutes())
    } else if delta.num_hours() < 24 {
        format!("{}h ago", delta.num_hours())
    } else {
        format!("{}d ago", delta.num_days())
    }
}
