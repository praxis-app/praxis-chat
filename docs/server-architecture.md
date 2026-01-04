# Server Architecture

## Overview

Praxis runs multiple servers inside a single instance. A `Server` groups channels, roles, invites, members, and configuration behind a unique `slug`. An `InstanceConfig` record points to the default server that acts as the demo/fallback space for visitors who arrive without an invite; once a user follows an invite, all context shifts to that invite’s server.

## Initialization & defaults

`initializeApp` calls `instanceService.initializeInstance()`, seeding an `InstanceConfig` row and the initial `praxis` server when none exist. Every new server automatically receives its own `ServerConfig` row and `general` channel via `initializeGeneralChannel(serverId)`.

The `defaultServerId` on `InstanceConfig` points to the demo/fallback server used for visitors without an invite; they land there to explore, and once they follow an invite link the context shifts to that invite’s server. The `/servers/default` endpoint lets the client discover this fallback when it lacks server context.

## Routing shape

- All server-scoped resources are nested under `/servers`:
  - `/servers` – list/create servers; `/:slug` fetch by slug; `/:serverId` update/delete.
  - `/:serverId/channels`, `/:serverId/roles`, `/:serverId/configs`, `/:serverId/invites` mount the feature routers.
- Public invite lookups stay at `/invites/:token`; creation/list/deletion use the nested `serverInvitesRouter`.
- `setServerMemberActivity` middleware (on `/:slug` and `/:serverId` routes) updates `ServerMember.lastActiveAt` for authenticated users, enabling “last used server” restoration.

## Data model

`Server` stores a unique `slug` plus name and description. `ServerMember` tracks `lastActiveAt` to infer the most recent server a user touched. `InstanceConfig` holds `defaultServerId`, which identifies the demo/fallback server.

## Membership & invites

Creating a server (`createServer(name, slug, description, currentUserId)`) adds the creator as a member and seeds that server’s general channel. `addMemberToServer(serverId, userId)` joins the user to the server and all current channels. Invites are server-scoped and sign up for non-first users requires an invite for the target server.

## Permissions

Permission lookups return rules keyed by `serverId` (`getServerPermissionsByUser`), enabling parallel memberships. Instance level roles cover cross-server actions such as creating servers. The shared `can` middleware in `src/common/roles` accepts `scope: 'server' | 'instance'` to enforce the right layer on each route.
