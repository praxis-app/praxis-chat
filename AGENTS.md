# Repository guidelines

## Project overview

- Praxis is a chat-based collaborative decision-making (CDM) app that blends informal discussion with structured decision-making. Groups can transition from casual conversation to formal proposals and voting without breaking flow.
- The backend stack (Node.js, Express, TypeORM, PostgreSQL, Redis) lives in `src/`, orchestrated from `src/main.ts`, with domain folders mirroring the service breakdown listed in `CLAUDE.md`.
- The React + Vite client resides in `view/`, leveraging Tailwind CSS, Radix UI, React Router, React Query, and Zustand.
- Shared TypeScript types and utilities live in `common/` under the `@common` alias; keep the directory focused on cross-surface contracts rather than business logic or UI.

## Required verifications

- After every code change, including backend, frontend, configuration, or shared library, run `npm run check` before signaling that the work is ready for review. This does not include changes to documentation.
- The command sequences `npm run types`, `npm run lint`, `npm run test`, `npm run test:client`, and `npm audit`; a clean run is required for any review or merge request.
- Fix failing steps locally and rerun `npm run check` until the entire chain succeeds; partial or skipped checks are not acceptable sign-off.

## Git command restrictions

- Do not run git commands that stage, commit, amend, stash, or rewrite history (`git add`, `git commit`, `git reset`, etc.); human maintainers own all source-control actions.
- Restrict yourself to read-only inspection commands such as `git status` or `git diff` when additional context is needed for editing.
