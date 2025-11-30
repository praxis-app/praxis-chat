# Server Architecture

## Overview

Praxis runs multiple servers inside a single instance. A `Server` groups channels, roles, invites, members, and configuration behind a unique `slug`. An `InstanceConfig` record points to the default server that acts as the demo/fallback space for visitors who arrive without an invite; once a user follows an invite, all context shifts to that invite’s server.

## Initialization & defaults

- `initializeApp` calls `instanceService.initializeInstance()`, which creates an `InstanceConfig` row and an initial server (`name`/`slug` of `praxis`) when none exist.
- Creating any server also creates its `ServerConfig` row and a `general` channel via `initializeGeneralChannel(serverId)`.
- The `defaultServerId` on `InstanceConfig` designates the demo/fallback server. Users without an invite are routed here so they can explore the app; once a user follows an invite link, they join that invite’s server instead. `/servers/default` exposes this server so the client can route newcomers appropriately.

## Routing shape

- All server-scoped resources are nested under `/servers`:
  - `/servers` – list/create servers; `/:slug` fetch by slug; `/:serverId` update/delete.
  - `/:serverId/channels`, `/:serverId/roles`, `/:serverId/configs`, `/:serverId/invites` mount the feature routers.
- Public invite lookups stay at `/invites/:token`; creation/list/deletion use the nested `serverInvitesRouter`.
- `setServerMemberActivity` middleware (on `/:slug` and `/:serverId` routes) updates `ServerMember.lastActiveAt` for authenticated users, enabling “last used server” restoration.

## Data model

- `Server` includes a unique `slug` alongside `name` and `description`.
- `ServerMember` includes `lastActiveAt`, used to infer a user’s most recent server.
- `InstanceConfig` stores `defaultServerId` which points to the demo/fallback server.

## Membership & invites

- `createServer(name, slug, description, currentUserId)` adds the creator as a member and seeds the general channel.
- `addMemberToServer(serverId, userId)` adds the user to the server and all existing channels.
- Invites are server-scoped: tokens carry `serverId`, and sign-up for non-first users requires an invite token pointing to the target server.

## Permissions

- Permission lookups return a map keyed by `serverId` (`getServerPermissionsByUser`), enabling parallel memberships.
- Instance-level roles manage cross-server actions (e.g., creating servers); the shared `can` middleware in `src/common/roles` supports both `scope: 'server' | 'instance'` to enforce the correct layer.
