use clap::{Parser, Subcommand};
use uuid::Uuid;

#[derive(Parser, Debug)]
#[command(
    name = "Praxis CLI",
    version,
    about = "Development and production utilities for Praxis Chat",
    arg_required_else_help = true
)]
pub struct Cli {
    /// Lookback window in days for commands that support it
    #[arg(long, global = true, default_value_t = 30)]
    pub days: i64,
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
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
    /// Print the current database schema (tables, columns, indexes, constraints, enums)
    Schema,
}
