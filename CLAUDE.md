# CLAUDE.md

This file provides guidance to [Claude Code](https://claude.com/product/claude-code) when working with code in this repository.

## Project Overview

Praxis is a chat-based collaborative decision-making (CDM) app that blends informal discussion with structured decision-making. Groups can transition from casual conversation to formal proposals and voting without breaking flow.

**Status**: Work in progress - experimental approach within the Praxis project ecosystem (main repo: https://github.com/praxis-app/praxis)

**Tech Stack**:

- Backend: Node.js, Express, TypeORM, PostgreSQL, Redis (WebSocket pub-sub)
- Frontend: React, React Router, Vite, Tailwind CSS, Radix UI
- Testing: Vitest (both client and server)
- Required: Node.js v22.11.0

## Development Workflow

**IMPORTANT**: After completing any logical unit of work (feature implementation, bug fix, refactor), run `npm run check` to verify everything works correctly before considering the work complete.

## Commands

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

**When to run `npm run check`:**

- After completing a logical unit of work (e.g., implementing a feature, fixing a bug, completing a refactor)
- For multi-step changes, run the check after the expected final step, not after every intermediate change
- Skip for very small changes (a few lines in a single file)
- When in doubt about whether a change is "small", err on the side of running the check

## Architecture

### Monorepo Structure

- **`src/`** - Backend (Express, TypeORM)
- **`view/`** - Frontend (React, Vite)
- **`common/`** - Shared code between frontend and backend (types, constants, utilities)
  - Import via `@common` alias
  - Only include frequently-used, side-effect-free code
  - No business logic, database models, middleware, or React components

### Backend Architecture (src/)

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
- `auth/` - Authentication & JWT middleware
- `cache/` - Redis caching service
- `channels/` - Chat channels, members, keys, cron jobs
- `common/` - Shared utilities and helpers (backend-specific)
- `database/` - TypeORM configuration, entities, migrations
- `health/` - Health check endpoints
- `images/` - Image uploads (multer) and processing
- `invites/` - Server invitations
- `messages/` - Chat messages
- `proposal-actions/` - Actions proposed for approval (roles, permissions, members)
- `proposals/` - Formal proposals and voting
- `pub-sub/` - WebSocket pub-sub server with Redis
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

### Frontend Architecture (view/)

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

## Code Guidelines

- Follow clear naming (no 1-2 letter names). Functions are verbs; variables are concrete nouns.
- Use guard clauses and early returns. Avoid deep nesting.
- Handle errors explicitly; surface user-facing errors via i18n on the client.
- Keep code readable and high-verbosity; avoid clever one-liners.
- For UI strings, always use react-i18next; do not hardcode user-visible text.
- Do not add ESLint ignore comments.

### Quality Verification

**Required**: Execute `npm run check` when your changes are complete and ready. This runs the full verification suite (types, lint, audit, and tests for both server and client).

When to run:

- After completing a logical unit of work
- For multi-step changes, after the final step (not every intermediate change)
- Always before considering work complete and ready for review
- Skip only for very small changes (a few lines in a single file)
- When in doubt, run the check

## TypeScript Configuration

Project uses TypeScript project references:

- `tsconfig.json` - Root configuration
- `tsconfig.src.json` - Backend (src/)
- `tsconfig.view.json` - Frontend (view/)

Backend uses `ts-node` with `tsconfig-paths` for path resolution and `tsc-alias` for build-time alias resolution.
