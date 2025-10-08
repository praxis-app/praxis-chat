export const VALID_EMAIL_REGEX = /^\S+@\S+\.\S+$/;
export const EMAIL_MAX_LENGTH = 254;

export const GENERATED_NAME_SEPARATOR = '_';
export const VALID_NAME_REGEX = new RegExp(
  `^[a-z0-9${GENERATED_NAME_SEPARATOR}]+$`,
);

export const MIN_NAME_LENGTH = 3;
export const MAX_NAME_LENGTH = 15;

export const MIN_DISPLAY_NAME_LENGTH = 4;
export const MAX_DISPLAY_NAME_LENGTH = 30;

export const MAX_BIO_LENGTH = 500;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;
