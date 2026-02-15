# Praxis CLI

A general purpose CLI tool with utilities for both development and production operations. The CLI provides utilities for checking statistics, viewing database schemas, and more.

## Quick start

```bash
# from repo root (relies on DB_* vars from your .env)
npm run cli -- poll-stats --days 14
# or run the binary directly
cd cli && cargo run -- poll-stats --channel-id d2f7...
```

The CLI derives its PostgreSQL connection string from `DB_USERNAME`, `DB_PASSWORD`, `DB_SCHEMA`, `DB_HOST`, and `DB_PORT`. Every pooled connection sets `SET default_transaction_read_only = on` to guard the production database.

## Current subcommands

### Statistics commands

- `poll-stats` – poll/proposal stats with vote breakdown, day-by-day creation trend, and top channels.

Supports `--days <int>` to control the lookback window (max 5 years).

### Database commands

- `schema` – prints the current database schema including tables, columns with data types, indexes, constraints, and enums.

### Development commands

- `routes` – prints all Express API routes extracted from router files. Supports `--path <substring>` to filter and `--tree` for a nested view.

## Future commands

The CLI is designed to expand with additional utilities for:

- Inspect config / environment variables (for "works on my machine")
- Viewing and filtering application logs with custom views
- Inspect background jobs or queues, retries, and failures
- Trigger a DB backup, list recent backups, restore
- Health check / "is anything broken?" button

## Environment variables

- `DB_USERNAME`, `DB_PASSWORD`, `DB_SCHEMA`, `DB_HOST`, `DB_PORT` – same variables used by the rest of the Praxis stack.

Optional vars are surfaced as CLI flags so developers can override per invocation.

## Sample invocations

```bash
# Highlight stats for a single decision room/channel
npm run cli -- poll-stats --channel-id 8a7...

# Deep dive into a single poll's vote mix
cd cli && cargo run -- poll-stats --poll-id 4bb...

# Bigger window with more leaders
npm run cli -- poll-stats --days 90 --top-channels 10

# Print database schema
npm run cli -- schema

# List all API routes
npm run cli -- routes
```

The CLI stays out of the primary workflow; running it is entirely optional but provides quick operational awareness during incident reviews and development tasks.
