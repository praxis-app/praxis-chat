export const ABILITY_ACTIONS = [
  'delete',
  'create',
  'read',
  'update',
  'manage',
] as const;

export const ABILITY_SUBJECTS = [
  'ServerConfig',
  'Channel',
  'Invite',
  'Message',
  'ServerRole',
  'all',
] as const;
