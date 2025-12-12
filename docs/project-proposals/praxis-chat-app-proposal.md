# Praxis - A Chat-based CDM App

Praxis is a chat-based collaborative decision-making (CDM) app that lets volunteer teams move seamlessly from informal conversation to structured proposals and votes. It is designed for a political organization that needs transparent decision-making without slowing day-to-day collaboration. V1 targets a production-ready experience combining real-time chat, structured governance flows, and essential operational features (auth, notifications, onboarding). This proposal outlines the product scope, implementation approach, and time estimates for two engineers.

## Value proposition

Praxis bridges the gap between traditional collaborative decision-making platforms and mainstream chat apps. Unlike Loomio or OpenSlides, which can feel rigid, forum-centric, or limited to specific organizational contexts, Praxis integrates structured decision-making directly into a familiar, real-time chat environment. Unlike general-purpose communication tools like Discord or Signal, Praxis is purpose-built to make creating proposals, voting, and deliberation seamless and actionable, without disrupting conversation flow or losing momentum. It provides a cohesive, all-in-one environment where communication flows and decision-making are fully integrated.

## Why chat-based?

- **Widespread familiarity** – With 3+ billion global chat app users, the interface pattern is already deeply familiar across cultures and demographics. This dramatically lowers barriers to adoption compared to traditional CDM tools, making participation more accessible.

- **Social decision-making** – Most decisions aren't purely analytical processes but deeply social ones. Chat interfaces excel at supporting the interpersonal dynamics, relationship building, and informal consensus-building that precede formal decisions, creating a more holistic decision-making environment.

- **Real-time momentum preservation** – Traditional CDM tools often suffer from "context switching fatigue" - users have to leave their conversation flow to create proposals in separate interfaces. Chat-based approaches let decisions emerge organically from discussions, capturing momentum when engagement is highest.

- **Mobile-first design** – Chat interfaces are much better optimized for mobile, crucial for organizers who coordinate on-the-go. Traditional CDM tools often have clunky mobile experiences that can hinder participation.

- **Chat-first extensibility** – Chat interfaces can smoothly incorporate forum-like features (forum channels, threads, pinned content) without disrupting the core experience. The inverse - adding fluid conversation to forum-based tools - typically results in awkward, bolted-on chat features that users avoid.

- **Progressive disclosure of complexity** – Chat can start simple (just discussing) then progressively reveal more structured features (polls, ranked choice, model of consensus) as needed. This lowers the initial learning curve compared to other options (e.g. Loomio, OpenSlides), that present all features upfront.

- **Integrated voice and video capabilities** – Chat platforms typically include VoIP and video calling. This enables quick escalation from text discussions to verbal deliberation when decisions require nuanced conversation, emotional connection, or complex negotiation. For distributed organizing, the ability to seamlessly transition between text and video within the same platform eliminates tool-switching friction and keeps all participants engaged regardless of their communication preferences.

## Objectives

Deliver a familiar chat experience that can pivot into structured decision flows without switching tools, support formal proposals and voting models inside the same interface, and ship a credible V1 for small to medium teams with a path to scaling and security hardening while keeping decisions transparent and auditable to build trust.

## Scope and Feature Set (V1)

The V1 scope maps directly to the maintained roadmap. Total estimated effort (serial) is about 9 months for two engineers; with parallel workstreams, expected elapsed time is about 4 months.

### Chat Features (about 2 months total)

- Send messages + image support: Core real-time chat with text and media (2.5 wks).
- Channel creation and management: Allow users to create, rename, and manage channels (2.5 wks).
- Reply threads: Enable threaded conversations for focus and clarity (2.5 wks).
- Forum-type channels: Structured deliberation with advanced sorting and filtering (1.5 wks).

### Decision-Making (about 4.5 months total)

- Proposals and voting: Core feature for structured group decisions (2.5 wks).
- General proposal type, manual: Non-functional, user-defined proposals (2.5 wks).
- Proposals to change settings: Formalize governance actions within the app (2.0 wks).
- Proposals to change roles: Role and permission changes executed through proposals (2.0 wks).
- Proposals to plan events: Integrated decision flow for event planning (1.0 wk).
- Majority vote model: Standard majority-based voting system (2.5 wks).
- Model of consensus: Decision model requiring full or near-unanimous agreement (2.0 wks).
- Consent model: A decision passes unless objections are raised (2.0 wks).
- Basic polls: Lightweight, informal decision-making or preference collection (2.5 wks).

### Auxiliary Features (about 2.5 months total)

- Demo mode (PoC): Simplified environment for showcasing functionality (1.5 wks).
- Onboarding / tutorial: Guided walkthrough with tooltips and interactive hints (1.5 wks).
- Events + in-app calendar: Schedule and view community events (1.0 wk).
- Server management, in progress: Manage and moderate multiple chat servers per instance (1.5 wks).
- Notifications: Real-time updates and push alerts (1.0 wk).
- Invite links: Simplify onboarding and team expansion (1.5 wks).
- User roles and permissions: Governance and moderation controls (1.5 wks).
- Basic search: Search messages, proposals, and threads (1.0 wk).

## Implementation Approach

Backend uses Node.js and Express with PostgreSQL and Redis; the front end uses React with Vite; shared types live in `@common` to keep contracts consistent. Real-time is handled with WebSockets plus Redis pub and sub, and the UI stays responsive with optimistic message sending. The data model covers channels, threads, proposals, votes, roles and permissions, events, and notifications, implemented with TypeORM entities and migrations per milestone.

Governance flows are pluggable so majority, consensus, and consent models apply per proposal with audit trails and immutable vote records. Security relies on role-based access control at API and UI layers, server-side validation, minimal PII encrypted at rest and in transit, and audit logging for proposal and role changes. Quality gates include linting, tests, and type checks through the `npm run check` chain, story fixtures for demo mode, and feature flags to reduce risk on modules such as notifications and forum sorting.

## Hosting & Infrastructure (initial phase)

A single small VPS on DigitalOcean with 1 vCPU and 2 GB of RAM is enough for early development, demos, and pilot usage. One registered domain (for example, praxischat.org) will handle auth callbacks, invite links, and branded URLs. PostgreSQL and Redis can share the VPS at first, with a plan to move them to managed services before broader rollout. HTTPS should use managed certificates such as Let’s Encrypt with a reverse proxy like Nginx or Caddy on the VPS. Lightweight observability can start with basic logs and an uptime monitor such as Healthchecks or UptimeRobot until traffic justifies a fuller stack.

### Dependencies & Risks

Push notifications may need APNs or FCM credentials, so account for provisioning lead time. Calendar exports such as ICS could depend on organization preferences, so the initial scope should stay with the in-app calendar. Governance models need clear in-product explanation with inline help and a short FAQ to avoid confusion. Data privacy requires minimal retention with export and delete options that match organizational policies.

## Success Metrics

Track time to decision as a percentage reduction versus manual baselines, weekly active decision-makers and proposal completion rate for engagement, p95 message delivery and proposal action latency for reliability, and the absence of unresolved audit discrepancies alongside qualitative feedback from the pilot cohort for trust.

## Next Steps

Confirm priority within the V1 roadmap and lock scope for the first six weeks, finalize the deployment environment including cloud account, database and Redis provisioning, and push credentials, then kick off Foundations and Chat Core in week one with weekly stakeholder demos.
