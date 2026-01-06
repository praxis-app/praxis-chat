# Poll Entity Architecture

## Overview

Praxis uses a **single Poll entity** as the base abstraction for all decision-making processes. This architecture makes it easy to extend the system with additional poll types and decision-making models in the future.

## Design Philosophy

Rather than creating separate entities for proposals, surveys, and other decision types, we use a **type discriminator pattern** with configuration-driven behavior. The Poll entity serves as a flexible foundation that can represent different types of collective decision-making.

## Current Implementation

### Poll Types

The `pollType` field (defined in `common/polls/poll.constants.ts`) currently supports:

- **`proposal`** - Formal proposals with structured voting (primary use case)
- **`poll`** - Basic polling functionality (reserved for future use)

### Proposals as Poll Type

Proposals are implemented as polls with `pollType: 'proposal'`. This includes:

- **Encrypted content** (`ciphertext`, `iv`, `tag` fields) for privacy
- **PollConfig** relationship for decision-making settings:
  - Decision-making model (consent, consensus, majority-vote)
  - Ratification thresholds
  - Limits on disagreements and abstains
  - Optional closing time
- **PollAction** relationship for proposed changes (roles, permissions, members)
- **Vote** collection for recording member decisions
- **Stage tracking** (voting, ratified, revision, closed)

See `src/polls/entities/poll.entity.ts` for the complete schema.

## Why This Architecture?

### Extensibility

Using Poll as the base entity allows us to add new decision-making types without major refactoring:

- **Time polls** for scheduling meetings
- **Dot voting** for resource allocation
- **Score voting** for rating options
- **Ranked choice** for preference ordering
- **Check-ins** for sentiment gathering

Each new type can be added by:

1. Adding a new value to `POLL_TYPE` constant
2. Configuring type-specific behavior and validation
3. Optionally adding type-specific entities or configuration

### Simplicity

All polls share:

- Common lifecycle (creation → voting → closing)
- Vote collection and tallying
- Encryption and privacy features
- Channel membership and permissions
- User relationships and timestamps

This eliminates duplication and keeps queries simple.

### Flexibility

Type-specific behavior can be implemented through:

- **Configuration tables** (like PollConfig for proposals)
- **Type-specific relationships** (like PollAction for proposals)
- **Conditional logic** based on `pollType` field
- **Separate UI components** for different voting interfaces

## Future Considerations

As new poll types are added, consider:

- Whether type-specific config belongs in PollConfig or separate tables
- How validation rules vary by type
- What vote methods (UI patterns) each type requires
- Whether results calculation differs by type

The current architecture provides a solid foundation for this growth.
