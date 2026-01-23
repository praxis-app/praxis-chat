# Praxis CLI

A general-purpose Rust CLI for development and production utilities for Praxis Chat. The CLI provides tools for inspecting database statistics, checking logs, viewing database schemas, and more.

## Quick start

```bash
# from repo root (relies on DB_* vars from your .env)
npm run cli -- proposal-funnel --days 14
# or run the binary directly
cd cli && cargo run -- vote-stats --channel-id d2f7...
```

The CLI derives its PostgreSQL connection string from `DB_USERNAME`, `DB_PASSWORD`, `DB_SCHEMA`, `DB_HOST`, and `DB_PORT`. Every pooled connection sets `SET default_transaction_read_only = on` to guard the production database.

## Current subcommands

### Statistics commands

- `proposal-funnel` – stage distribution, day-by-day creation trend, and top channels for proposals.
- `vote-stats` – vote mix, turnout, and most active polls (or a single poll via `--poll-id`).

Both subcommands share `--days <int>` to control the lookback window (max 5 years).

## Future commands

The CLI is designed to expand with additional utilities for:
- Viewing and filtering application logs
- Inspecting database schema and migrations
- Other development and production operations

## Query verification

Because the CLI uses dynamic `sqlx` queries, you can still verify them via:

```bash
export DATABASE_URL="postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_SCHEMA}"
cd cli
cargo sqlx prepare -- --database-url "$DATABASE_URL"
# or, if you prefer, dry-run your existing migrations
sqlx migrate run \
  --source ../src/database/migrations \
  --database-url "$DATABASE_URL" \
  --dry-run
```

## Environment variables

- `DB_USERNAME`, `DB_PASSWORD`, `DB_SCHEMA`, `DB_HOST`, `DB_PORT` – same variables used by the rest of the Praxis stack.

Optional vars are surfaced as CLI flags so developers can override per invocation.

## Sample invocations

```bash
# Highlight funnel stats for a single decision room/channel
npm run cli -- proposal-funnel --channel-id 8a7...

# Deep dive into a single poll's vote mix
cd cli && cargo run -- vote-stats --poll-id 4bb...

# Bigger window with more leaders
npm run cli -- proposal-funnel --days 90 --top-channels 10
```

The CLI stays out of the primary workflow; running it is entirely optional but provides quick operational awareness during incident reviews, governance cadences, and development tasks.
