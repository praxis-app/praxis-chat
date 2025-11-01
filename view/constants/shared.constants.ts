export const URL_REGEX = /(https?:\/\/[^\s]+)/g;
export const MIDDOT_WITH_SPACES = ' · ';

export enum Time {
  Minute = 60,
  Hour = 3600,
  Day = 86400,
  Week = 604800,
  Month = 2628000,
}

export enum KeyCodes {
  Enter = 'Enter',
  Escape = 'Escape',
}

export enum BrowserEvents {
  Keydown = 'keydown',
  MouseDown = 'mousedown',
  MouseUp = 'mouseup',
  Resize = 'resize',
  Scroll = 'scroll',
}

export enum NavigationPaths {
  Home = '/',
  Login = '/auth/login',
  SignUp = '/auth/signup',
  Channels = '/channels',
  Invites = '/settings/invites',
  ProposalSettings = '/settings/proposals',
  UsersEdit = '/users/edit',
  ServerRoles = '/settings/roles',
  Settings = '/settings',
}

export enum TruncationSizes {
  ExtraSmall = 16,
  Small = 25,
  Medium = 35,
  Large = 65,
  ExtraLarge = 175,
}

export enum LocalStorageKeys {
  AccessToken = 'access_token',
  InviteToken = 'invite-token',
  HideWelcomeMessage = 'hide-welcome-message',
}
