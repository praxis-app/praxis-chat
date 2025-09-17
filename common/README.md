# /common

Code shared between frontend (`/view`) and backend (`/src`).

## What goes here

- TypeScript types and interfaces for API contracts
- Constants and enums used by both sides
- Pure utility functions with no side effects
- Validation schemas

## What doesn't go here

- Business logic specific to one side
- Database models (backend only)
- Express middleware (backend only)
- React components (frontend only)

## Conventions

- Only include code that's frequently used by both frontend and backend
- Use `@common` imports via TypeScript path mapping
- Keep all code side-effect free
