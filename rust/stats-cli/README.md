# Praxis Stats CLI

Colorful, read-only Rust CLI for inspecting proposal and vote throughput in your Praxis PostgreSQL database.

## Quick start

```bash
# from repo root
export DATABASE_URL=postgres://user:pass@localhost:5432/praxis
npm run stats:reports -- proposal-funnel --days 14
# or run the binary directly
cd rust/stats-cli && cargo run -- vote-stats --channel-id d2f7...
```

The CLI defaults to a 30‑day window and will refuse to run without `DATABASE_URL`. Every pooled connection sets `SET default_transaction_read_only = on` to protect the production database.

## Subcommands

- `proposal-funnel` – stage distribution, day-by-day creation trend, and top channels for proposals.
- `vote-stats` – vote mix, turnout, and most active polls (or a single poll via `--poll-id`).

Both subcommands share `--days <int>` to control the lookback window (max 5 years).

## Query verification

Because the CLI uses dynamic `sqlx` queries, you can still verify them via:

```bash
cd rust/stats-cli
cargo sqlx prepare -- --database-url "$DATABASE_URL"
# or, if you prefer, dry-run your existing migrations
sqlx migrate run \
  --source ../../src/database/migrations \
  --database-url "$DATABASE_URL" \
  --dry-run
```

## Environment variables

- `DATABASE_URL` – PostgreSQL connection string (same format as the rest of the Praxis stack).

Optional vars are surfaced as CLI flags so developers can override per invocation.

## Sample invocations

```bash
# Highlight funnel stats for a single decision room/channel
npm run stats:reports -- proposal-funnel --channel-id 8a7...

# Deep dive into a single poll's vote mix
cargo run -- vote-stats --poll-id 4bb...

# Bigger window with more leaders
npm run stats:reports -- proposal-funnel --days 90 --top-channels 10
```

The CLI stays out of the primary workflow; running it is entirely optional but provides quick operational awareness during incident reviews or governance cadences.
