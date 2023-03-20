export const ORDER_STATUS_ENUM = ['confirmed', 'completed', 'canceled'];
export const USER_ROLES = {
  ADMIN: 'admin',
  MASTER: 'master',
  CLIENT: 'client',
};

export const ACCESS_SCOPE = {
  AnyAuth: [USER_ROLES.ADMIN, USER_ROLES.MASTER, USER_ROLES.CLIENT],
  AdminOnly: [USER_ROLES.ADMIN],
  MasterOnly: [USER_ROLES.MASTER],
  ClientOnly: [USER_ROLES.CLIENT],
  MasterOrClient: [USER_ROLES.MASTER, USER_ROLES.CLIENT],
};

export const SNACKBAR_MAX_SNACKS = 5;
export const SNACKBAR_AUTOHIDE_TIMEOUT = 6000;
export const ACCESS_TOKEN_KEY_NAME = 'access_token';
