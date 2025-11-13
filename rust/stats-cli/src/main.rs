mod cli;
mod db;
mod proposal;
mod utils;
mod vote;

use anyhow::{Context, Result};
use clap::Parser;
use sqlx::postgres::PgPoolOptions;

use cli::{Cli, Commands};
use db::build_database_url_from_env;
use proposal::run_proposal_funnel;
use utils::normalize_window;
use vote::run_vote_stats;

const DEFAULT_MAX_CONNECTIONS: u32 = 5;

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
