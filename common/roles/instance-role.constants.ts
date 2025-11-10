// TODO: Decide whether to use the same actions as server roles or to create new ones
export const INSTANCE_ROLE_ABILITY_ACTIONS = [
  'delete',
  'create',
  'read',
  'update',
  'manage',
] as const;

export const INSTANCE_ROLE_ABILITY_SUBJECTS = [
  'InstanceRole',
  'Server',
  'all',
] as const;
