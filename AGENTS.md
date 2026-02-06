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
author: codex
change_type: feat|fix|refactor|perf|docs|chore
area: src/messages, view/components/messages
files_changed: 2-3 files
lines_changed: '+128/-34'
verification: `npm run check` passed
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
