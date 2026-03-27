# CLAUDE.md

This file provides guidance to [Claude Code](https://claude.com/product/claude-code) when working with code in this repository.

## Project Overview

Praxis is a chat-based collaborative decision-making (CDM) app that blends informal discussion with structured decision-making. Groups can transition from casual conversation to formal proposals and voting without breaking flow.

Refer to README.md for more information.

**Tech Stack**:

- Backend: Node.js, Express, TypeORM, PostgreSQL, Redis
- Frontend: React, React Router, Vite, Tailwind CSS, Radix UI
- Testing: Vitest (both client and server)
- Required: Node.js v24.12.0

## Architecture

### Monorepo Structure

- **`src/`** - Backend (Express, TypeORM)
- **`view/`** - Frontend (React, Vite)
- **`common/`** - Shared code between frontend and backend
  - Import via `@common` alias
  - **Include**: TypeScript types/interfaces, constants/enums, pure utility functions, validation schemas
  - **Exclude**: Business logic, database models, Express middleware, React components
  - **Examples**: `common/polls/poll.types.ts`, `common/votes/vote.constants.ts`

### Backend Architecture (`src/`)

#### Core Structure

- **Entry**: `main.ts` initializes Express server, TypeORM, Redis cache, cron jobs, and WebSocket server
- **Database**: TypeORM with PostgreSQL (`database/data-source.ts`)
  - All entities registered in `data-source.ts`
  - Development uses `synchronize: true`; production runs migrations via `DB_MIGRATIONS=true`
- **HTTP Layer**: Express-based request handling
  - Routers in `*.router.ts` files define API endpoints
  - Controllers in `*.controller.ts` handle HTTP requests and responses
  - Middleware in `middleware/*.middleware.ts` for validation, auth, permissions
- **Business Logic**: Services in `*.service.ts` contain reusable business operations
- **Auth**: JWT tokens, bcrypt password hashing
- **Pub-Sub**: WebSocket server (`pub-sub/pub-sub.service.ts`) with Redis-backed channel subscriptions
  - Handles SUBSCRIBE, PUBLISH, UNSUBSCRIBE requests
  - Token-based auth and channel access control via CASL
- **Permissions**: CASL-based authorization (`roles/`) with channel-level access control
- **Cron Jobs**: Channel key rotation (`channels/cron/rotate-channel-keys.job.ts`)

#### Directory Structure

- `app/` - Application initialization and configuration
- `bots/` - Bot entity, default bot bootstrap, and shared bot helpers
- `auth/` - Authentication & JWT middleware
- `cache/` - Redis caching service
- `channels/` - Chat channels, members, keys, cron jobs
- `common/` - Shared utilities and helpers (backend-specific)
- `database/` - TypeORM configuration, entities, migrations
- `health/` - Health check endpoints
- `images/` - Image uploads (multer) and processing
- `invites/` - Server invitations
- `messages/` - Chat messages
- `poll-actions/` - Actions proposed for approval (roles, permissions, members)
- `polls/` - Polls and proposals (proposals are implemented as polls with `pollType: 'proposal'`)
- `pub-sub/` - WebSocket pub-sub server with Redis-backed channel subscriptions
- `roles/` - RBAC with permissions (CASL-based)
- `server-configs/` - Server-wide settings
- `tests/` - Test utilities and fixtures
- `users/` - User accounts and profiles
- `votes/` - Voting system

#### File Naming Conventions

Backend files follow kebab-case naming with type suffixes:

- **Controllers**: `*.controller.ts` - Handle HTTP requests and responses
- **Services**: `*.service.ts` - Contain business logic and reusable operations
- **Routers**: `*.router.ts` - Define Express routes
- **Middleware**: `*.middleware.ts` - Express middleware functions
- **Entities**: `*.entity.ts` - TypeORM database entities
- **DTOs**: `*.dto.ts` - Data transfer objects for validation
- **Tests**: `*.test.ts` - Vitest test files

Examples:

- `src/messages/messages.controller.ts`
- `src/users/middleware/validate-user.middleware.ts`

### Frontend Architecture (`view/`)

#### Core Structure

- **Entry**: `main.tsx` renders React Router app
- **Routing**: `routes/*.router.tsx` files define page routes
- **Components**: Organized by feature (`components/{feature}/`)
  - `components/ui/` - Radix UI primitives wrapped with Tailwind
  - `components/shared/` - Reusable cross-feature components
- **State**: Zustand stores, React Query for server state
- **Styling**: Tailwind CSS with custom design system
- **i18n**: react-i18next for internationalization (`locales/`)
- **WebSocket**: `react-use-websocket` for real-time updates

#### Directory Structure

- `assets/` - Static assets (images, fonts, etc.)
- `client/` - API client and HTTP request utilities
- `components/` - React components organized by feature
- `constants/` - Frontend constants and configuration
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and helpers
- `locales/` - i18n translation files
- `pages/` - Page-level components
- `routes/` - React Router route definitions
- `store/` - Zustand state management stores
- `styles/` - Global CSS and Tailwind configuration
- `test/` - Test utilities and setup
- `types/` - TypeScript type definitions

#### File Naming Conventions

Frontend files follow kebab-case naming:

- **Components**: `component-name.tsx` - React components
- **Hooks**: `use-hook-name.ts` - Custom React hooks (prefixed with `use-`)
- **Stores**: `feature-name.store.ts` - Zustand stores
- **Routes**: `feature.router.tsx` - Route definitions
- **Types**: `feature.types.ts` - TypeScript type definitions
- **Utils**: `feature.utils.ts` - Utility and helper functions

Examples:

- `view/components/messages/message-list.tsx`
- `view/hooks/use-websocket-client.ts`
- `view/routes/channels.router.tsx`
- `view/store/auth.store.ts`

### Path Aliases

```typescript
// Vite (frontend)
@/ → view/
@common → common/

// TypeScript (backend)
@/ → src/
@common → common/
```

## Development Workflow

### Commands

#### Testing

```bash
npm test               # Run backend tests only (vitest src)
npm run test:client    # Run frontend tests only (vitest view)
npm run test:watch     # Run tests in watch mode
npm run test:ui        # Open Vitest UI
```

#### Building & Quality Checks

```bash
npm run build          # Build backend (TypeScript + ESLint + tsc-alias)
npm run build:client   # Build frontend for production
npm run types          # Type-check all code
npm run lint           # Run ESLint
npm run check          # Full verification: types, lint, tests (client + server), audit
```

**When to run `npm run check`:**

- After completing a logical unit of work (e.g., implementing a feature, fixing a bug, completing a refactor)
- For multi-step changes, run the check after the expected final step, not after every intermediate change
- Skip for very small changes (a few lines in a single file)
- Skip for changes that only affect documentation
- When in doubt about whether a change is "small", err on the side of running the check

## Substantial change logging

- For every substantial change, add a new log entry file in `.docs/logs/`.
- A change is substantial when any of the following conditions are true:
  - Introduces a new feature or significant functionality changes
  - Changes more than 100 lines of code in total (added + removed)
  - Fixes a bug that is likely to be encountered by users
  - Improves the performance of the application
  - Spans multiple files

- Keep entries short and human-readable, but include enough metadata for future search/audits.
- Include a brief summary of the prompt or query that prompted the substantial change (e.g. the user request or task that led to the work).
- Use one file per substantial change with this naming convention:
  - `.docs/logs/YYYY-MM-DD-HHMM-short-slug.md` (UTC timestamp recommended).

### Recommended entry format:

```md
---
date: 2026-02-06T15:45:00Z
author: claude
verification: `npm run check` passed|failed|skipped:reason
change_type: feat|fix|refactor|perf|docs|chore
area: src/messages, view/components/messages
lines_changed: '+128/-34'
files_changed: 2
prompt_summary: Short summary of the user request or query that prompted this change
content: The body of this log entry - 1-3 sentences on what changed, why, and any other relevant details
---

## Summary

1-3 sentences on what changed.

## Why

Reason for the change and intended outcome.

## Risks / Follow-ups

Known risks, migrations, or next steps.
```

## Git command restrictions

- Do not run git commands that stage, commit, amend, stash, or rewrite history (`git add`, `git commit`, `git reset`, etc.); human maintainers own all source-control actions.
- Restrict yourself to read-only inspection commands such as `git status` or `git diff` when additional context is needed for editing.

## Code Guidelines

- Follow clear naming (no 1-2 letter names). Functions are verbs; variables are concrete nouns.
- Use guard clauses and early returns. Avoid deep nesting.
- Handle errors explicitly; surface user-facing errors via i18n on the client.
- Keep code readable and high-verbosity; avoid clever one-liners.
- For UI strings, always use react-i18next; do not hardcode user-visible text.
- Do not add ESLint ignore comments.

## TypeScript Configuration

Project uses TypeScript project references:

- `tsconfig.json` - Root configuration
- `tsconfig.src.json` - Backend (src/)
- `tsconfig.view.json` - Frontend (view/)

Backend uses `tsx` for TypeScript execution and `tsc-alias` for build-time alias resolution. TypeORM entities require explicit `type` in `@Column()` decorators since tsx/esbuild doesn't support `emitDecoratorMetadata`.
