// TODO: Move dupe constants to shared folder in project root

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
  'Role',
  'all',
] as const;

export const ROLE_ATTRIBUTE_CHANGE_TYPE = ['add', 'remove'] as const;

export const PERMISSION_KEYS = [
  'manageChannels',
  'manageSettings',
  'createInvites',
  'manageInvites',
  'manageRoles',
] as const;

export const ROLE_COLOR_OPTIONS = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#607d8b',
];
