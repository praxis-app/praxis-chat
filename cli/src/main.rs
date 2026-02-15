mod cli;
mod db;
mod integrity;
mod poll;
mod routes;
mod schema;
mod utils;

use anyhow::{Context, Result};
use clap::Parser;
use sqlx::postgres::PgPoolOptions;

use cli::{Cli, Commands};
use db::build_database_url_from_env;
use integrity::run_integrity_check;
use poll::run_poll_stats;
use routes::run_routes;
use schema::run_schema;
use utils::normalize_window;

const DEFAULT_MAX_CONNECTIONS: u32 = 5;

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    let cli = Cli::parse();

    // Routes command doesn't need a database connection
    if let Commands::Routes { path, tree } = cli.command {
        return run_routes(path, tree);
    }

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
        Commands::PollStats {
            channel_id,
            poll_id,
            top_polls,
            top_channels,
        } => {
            run_poll_stats(&pool, day_window, channel_id, poll_id, top_polls, top_channels).await?;
        }
        Commands::Schema => {
            run_schema(&pool).await?;
        }
        Commands::IntegrityCheck => {
            run_integrity_check(&pool).await?;
        }
        Commands::Routes { .. } => unreachable!(),
    }

    Ok(())
}
