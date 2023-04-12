export const ORDER_STATUS = {
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MASTER: 'master',
  CLIENT: 'client',
  GUEST: 'guest',
};

export const ACCESS_SCOPE = {
  AnyAuth: [USER_ROLES.ADMIN, USER_ROLES.MASTER, USER_ROLES.CLIENT],
  AdminOnly: [USER_ROLES.ADMIN],
  MasterOnly: [USER_ROLES.MASTER],
  ClientOnly: [USER_ROLES.CLIENT],
  MasterOrClient: [USER_ROLES.MASTER, USER_ROLES.CLIENT],
  AdminOrMaster: [USER_ROLES.ADMIN, USER_ROLES.MASTER],
  GuestOrClient: [USER_ROLES.GUEST, USER_ROLES.CLIENT],
};

export const SNACKBAR_MAX_SNACKS = 5;
export const SNACKBAR_AUTOHIDE_TIMEOUT = 6000;
export const ACCESS_TOKEN_KEY_NAME = 'access_token';

export const ERROR_TYPE = {
  SERVICE_OFFLINE: 'SERVICE_OFFLINE',
  ENTRY_NOT_FOUND: 'ENTRY_NOT_FOUND',
  ACCESS_DENIED: 'ACCESS_DENIED',
  BAD_REQUEST: 'BAD_REQUEST',
  UNKNOWN: 'UNKNOWN',
  NONE: 'NONE',
};

export const MAX_RATING_VALUE = 5;
export const RATING_PRECISION_STEP = 0.5;
export const RATING_FORMAT_DECIMAL = 1;

export const ACCEPTED_IMAGE_TYPES = { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] };
export const MAX_IMAGES_COUNT = 5;
export const MAX_IMAGE_BYTES_SIZE = 1024 * 1024;

export const PAGINATION_PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export const STRING_TYPE_OPERATORS = [
  { name: 'contains', value: 'contains' },
  { name: 'equals', value: 'equals' },
  { name: 'starts with', value: 'startsWith' },
  { name: 'ends with', value: 'endsWith' },
];

export const NUMBER_TYPE_OPERATORS = [
  { name: '=', value: 'eq' },
  { name: '!=', value: 'ne' },
  { name: '>', value: 'gt' },
  { name: '>=', value: 'gte' },
  { name: '<', value: 'lt' },
  { name: '<=', value: 'lte' },
];

export const BOOLEAN_TYPE_OPERATORS = [
  { name: 'is', value: 'is' },
  { name: 'is not', value: 'isNot' },
];

export const DATETIME_TYPE_OPERATORS = [
  { name: 'is', value: 'eq' },
  { name: 'is not', value: 'ne' },
  { name: 'is after', value: 'gt' },
  { name: 'is on or after', value: 'gte' },
  { name: 'is before', value: 'lt' },
  { name: 'is on or before', value: 'lte' },
  { name: 'is in between', value: 'between' },
];

export const ENUM_ORDERS_STATUS_OPERATORS = [{ name: 'is', value: 'eq' }]; //enum_orders_status
