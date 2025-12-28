# Anonymous Users and Invites Architecture

Support for anonymous users is currently implemented for demoing and proof of concept purposes. This functionality will likely be removed in the future once core functionality is fully implemented, as noted in `src/users/users.service.ts`.

## Current State

The `anonymousUsersEnabled` setting in `ServerConfig` controls whether anonymous user sessions can be created for a server. This boolean field defaults to `false` and is validated in `validate-create-anon.middleware.ts` before creating anonymous sessions. Users can toggle this setting in `GeneralServerSettings`.

Currently, invites are always required for both anonymous and registered user sign ups. The `validate-create-anon.middleware.ts` middleware requires an `inviteToken` for anonymous sessions, while `validate-sign-up.middleware.ts` requires an invite for registered users, except for the first user (admin) who can always sign up without an invite.

When a user attempts to create an anonymous session via the `/auth/anon` endpoint, the `validateCreateAnon` middleware validates that an `inviteToken` is provided, that `anonymousUsersEnabled` is `true` for the invite's server, and that the invite token is valid. If all checks pass, the service creates an anonymous user for the invite's server.

## Future: `invitesRequired` Setting

A `invitesRequired` setting in `ServerConfig` will eventually be added to control whether invites are required for sign ups on a given server, applying to both anonymous and registered users. This setting will be independent of `anonymousUsersEnabled`. The `anonymousUsersEnabled` setting answers "Can anonymous sessions be created?" while `invitesRequired` answers "Are invites needed to sign up?"

When `invitesRequired` is `false`, anonymous users will be able to sign up on the default server without an invite (assuming `anonymousUsersEnabled` is `true`). Registered users will also be able to sign up on the default server without an invite. Invite links will still work and will determine the target server when provided.

The middleware will need to check `invitesRequired` when no `inviteToken` is provided, falling back to the default server when invites aren't required. The first user bypass logic should remain, allowing the first user to sign up without an invite regardless of the `invitesRequired` setting.

## Key Files

- `src/auth/middleware/validate-create-anon.middleware.ts` - Anonymous session validation
- `src/auth/middleware/validate-sign-up.middleware.ts` - Registered user sign-up validation
- `src/auth/auth.service.ts` - `createAnonSession()` and `signUp()` functions
- `src/servers/server-configs/entities/server-config.entity.ts` - ServerConfig entity
- `view/pages/settings/general-server-settings.tsx` - UI for `anonymousUsersEnabled`
