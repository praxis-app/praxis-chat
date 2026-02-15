# Praxis - Chat-Based CDM

Praxis is a chat-based collaborative decision-making (CDM) app that seamlessly blends informal discussion with structured decision-making processes. Groups can transition smoothly from casual conversation to formal proposals and voting without breaking flow or losing context.

Designed for organizations, teams, and communities that need robust group decision-making capabilities, it combines the familiarity of messaging apps with flexible decision-making tools, multiple voting models, and forum-style organization when needed.

Praxis is free and open source software, as specified by the GNU General Public License.

## Work in progress

You are entering a construction yard. Things are going to change and break regularly as the project is still getting off the ground. Please bear in mind that Praxis is not yet intended for serious use outside of testing or research purposes. Your feedback is highly welcome.

Please note that this is also an experimental approach within the Praxis project. The main repository is located at https://github.com/praxis-app/praxis.

## Tech stack and architecture

Praxis is set up as a monolithic application that contains both backend and frontend code in the same repository and deploys them together as well. The backend is located in `src/`, the frontend in `view/`, and shared code is in `common/`.

**Stack**:

- Backend: Node.js v24.12.0, Express, TypeORM, PostgreSQL, Redis
- Frontend: React, React Router, Vite, Shadcn UI
- Testing: Vitest (both client and server)

## Installation and setup

Ensure that you have [Node.js](https://nodejs.org/en/download) v24.12.0 installed on your machine before proceeding.

```bash
# Install project dependencies
$ npm install

# Copy environment variables
$ cp .env.example .env
```

## Running the app

```bash
# Start server for development
$ npm run start

# Start client for development
$ npm run start:client
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view and interact with the UI.

## Docker

Install [Docker](https://docs.docker.com/engine/install) to use the following commands.

```bash
# Start app in a container
$ docker compose up -d

# Build and restart app after making changes
$ docker compose up -d --build
```

## Migrations

TypeORM is used to handle database interactions and migrations. [PostgreSQL](https://www.postgresql.org/download) is the primary database and can be run via Docker or installed locally.

If you're using a locally installed instance of PostgreSQL, ensure that connection details in your `.env` file are correct.

```bash
# Create a new migration
$ npm run typeorm:gen ./src/database/migrations/<migration-name>

# Run migrations
$ npm run typeorm:run
```

To run migrations in production, set `DB_MIGRATIONS` to `true` in your `.env` file. This will run migrations on startup via `start-prod.sh`.

## CLI

The project includes a Rust-based CLI tool for both development and production operations.

```bash
# Example: view poll and proposal stats
npm run cli -- poll-stats --days 14

# Example: print database schema
npm run cli -- schema
```

See the [CLI README](cli/README.md) for full documentation.

## Documentation

For detailed documentation on architecture, deployment, planned features, and implementation details, see the [/docs](docs/README.md) directory.

## Contributions

Praxis is open to contributions. Please read [CONTRIBUTING.md](https://github.com/praxis-app/praxis-chat/blob/main/CONTRIBUTING.md) for more details.
