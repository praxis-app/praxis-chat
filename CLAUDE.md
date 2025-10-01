# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Praxis is a chat-based collaborative decision-making (CDM) app that blends informal discussion with structured decision-making. Groups can transition from casual conversation to formal proposals and voting without breaking flow.

**Status**: Work in progress - experimental approach within the Praxis project ecosystem (main repo: https://github.com/praxis-app/praxis)

**Tech Stack**:

- Backend: Node.js, Express, TypeORM, PostgreSQL, Redis (WebSocket pub-sub)
- Frontend: React, React Router, Vite, Tailwind CSS, Radix UI
- Testing: Vitest (both client and server)
- Required: Node.js v22.11.0

## Commands

### Development

```bash
npm run start           # Start backend server for development
npm run start:dev       # Start backend with nodemon (auto-restart)
npm run start:client    # Start Vite dev server on localhost:3000
```

### Testing

```bash
npm test               # Run backend tests (vitest src)
npm run test:client    # Run frontend tests (vitest view)
npm run test:watch     # Run tests in watch mode
npm run test:ui        # Open Vitest UI
```

### Building & Quality Checks

```bash
npm run build          # Build backend (TypeScript + ESLint + tsc-alias)
npm run build:client   # Build frontend for production
npm run types          # Type-check all code
npm run lint           # Run ESLint
npm run check          # Full verification: types, lint, tests (client + server), audit
```

### Database Migrations

```bash
npm run typeorm:gen ./src/database/migrations/<migration-name>  # Generate migration
npm run typeorm:run                                              # Run migrations
```

TypeORM handles database migrations. PostgreSQL can run via Docker or locally - ensure `.env` connection details are correct.

## Architecture

### Monorepo Structure

- **`src/`** - Backend (Express, TypeORM)
- **`view/`** - Frontend (React, Vite)
- **`common/`** - Shared code between frontend and backend (types, constants, utilities)
  - Import via `@common` alias
  - Only include frequently-used, side-effect-free code
  - No business logic, database models, middleware, or React components

### Backend Architecture (src/)

- **Entry**: `main.ts` initializes Express server, TypeORM, Redis cache, cron jobs, and WebSocket server
- **Database**: TypeORM with PostgreSQL (`database/data-source.ts`)
  - All entities registered in `data-source.ts`
  - Development uses `synchronize: true`; production runs migrations via `DB_MIGRATIONS=true`
- **Routing**: Express routers in `*.router.ts` files
  - Controllers in `*.controller.ts` handle business logic
  - Services in `*.service.ts` contain reusable logic
  - Middleware in `middleware/*.middleware.ts` for validation, auth, permissions
- **Auth**: JWT tokens, bcrypt password hashing
- **Pub-Sub**: WebSocket server (`pub-sub/pub-sub.service.ts`) with Redis-backed channel subscriptions
  - Handles SUBSCRIBE, PUBLISH, UNSUBSCRIBE requests
  - Token-based auth and channel access control via CASL
- **Permissions**: CASL-based authorization (`roles/`) with channel-level access control
- **Cron Jobs**: Channel key rotation (`channels/cron/rotate-channel-keys.job.ts`)

Key modules:

- `auth/` - Authentication & JWT middleware
- `channels/` - Chat channels, members, keys
- `messages/` - Chat messages
- `proposals/` - Formal proposals and voting
- `proposal-actions/` - Actions proposed for approval (roles, permissions, members)
- `roles/` - RBAC with permissions
- `users/` - User accounts and profiles
- `invites/` - Server invitations
- `images/` - Image uploads (multer)
- `server-configs/` - Server-wide settings
- `votes/` - Voting system

### Frontend Architecture (view/)

- **Entry**: `main.tsx` renders React Router app
- **Routing**: `routes/*.router.tsx` files define page routes
- **Components**: Organized by feature (`components/{feature}/`)
  - `components/ui/` - Radix UI primitives wrapped with Tailwind
  - `components/shared/` - Reusable cross-feature components
- **State**: Zustand stores, React Query for server state
- **Styling**: Tailwind CSS with custom design system
- **i18n**: react-i18next for internationalization (`locales/`)
- **WebSocket**: `react-use-websocket` for real-time updates

### Path Aliases

```typescript
// Vite (frontend)
@/ → view/
@common → common/

// TypeScript (backend)
@/ → src/
@common → common/
```

## Code Guidelines

- Follow clear naming (no 1-2 letter names). Functions are verbs; variables are concrete nouns.
- Use guard clauses and early returns. Avoid deep nesting.
- Handle errors explicitly; surface user-facing errors via i18n on the client.
- Keep code readable and high-verbosity; avoid clever one-liners.
- For UI strings, always use react-i18next; do not hardcode user-visible text.
- Use `npm run check` to verify changes.
- Do not add ESLint ignore comments.

### Git Safety

VCS operations that modify history or remote state are prohibited. This includes:

- `git add`, `git commit`, `git push`, `git tag`, `git rebase`, `git merge`, `git cherry-pick`, `git reset --hard`
- `gh pr create`, `gh pr merge`, `gh release *`, `gh repo *`

## TypeScript Configuration

Project uses TypeScript project references:

- `tsconfig.json` - Root configuration
- `tsconfig.src.json` - Backend (src/)
- `tsconfig.view.json` - Frontend (view/)

Backend uses `ts-node` with `tsconfig-paths` for path resolution and `tsc-alias` for build-time alias resolution.
