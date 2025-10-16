# Server Architecture

## Overview

The `Server` entity provides organizational structure for Praxis instances by grouping channels, roles, and members together. Currently, Praxis operates with a single server per instance, but the architecture is designed to support multiple servers in the future.

## Current Implementation

### Server Entity

The Server entity (`src/servers/entities/server.entity.ts`) defines the core data model with relationships to:

- **ServerMembers**: Users who belong to the server
- **Channels**: Chat channels associated with the server
- **Roles**: Permission-based roles scoped to the server
- **ServerConfig**: Server-specific configuration settings
- **Invites**: Server invitation tokens for new users

Each server has a unique name and optional description.

### Single-Server Model

The current implementation assumes one server per Praxis instance:

- **Initial Server**: On first use, an initial server named "praxis" is created automatically
- **`getServerSafely()`**: Always returns the first (and only) server, creating it if needed
- **Race Condition Handling**: Concurrent requests safely handle duplicate server creation attempts
- **Member Addition**: New users are automatically added to the single server and all its channels

### Purpose

This architecture serves as foundational infrastructure for future multi-server support. By establishing server relationships now, entities like channels, roles, members, and invites already reference a server ID. When multiple servers are supported, minimal schema changes will be required, primarily adding server selection/creation UI and updating services to handle multiple server contexts.

## Future Considerations

To enable multiple servers per instance:

- Add server creation and management endpoints
- Implement server selection UI
- Update services to accept server context instead of assuming a single server
- Add server invitations and discovery mechanisms
- Handle cross-server user presence and permissions
