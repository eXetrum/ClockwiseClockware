const ORDER_STATUS = {
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELED: 'canceled'
};

const USER_ROLES = {
    ADMIN: 'admin',
    MASTER: 'master',
    CLIENT: 'client'
};

const ACCESS_SCOPE = {
    AnyAuth: [USER_ROLES.ADMIN, USER_ROLES.MASTER, USER_ROLES.CLIENT],
    AdminOnly: [USER_ROLES.ADMIN],
    MasterOnly: [USER_ROLES.MASTER],
    ClientOnly: [USER_ROLES.CLIENT],
    MasterOrClient: [USER_ROLES.MASTER, USER_ROLES.CLIENT],
    AdminOrMaster: [USER_ROLES.ADMIN, USER_ROLES.MASTER]
};

const MS_PER_HOUR = 60 * 60 * 1000;

const MIN_RATING_VALUE = 0;
const MAX_RATING_VALUE = 5;

const MAX_IMAGES_COUNT = 5;
const MAX_IMAGE_SIZE_BYTES = 1024 * 1024;

const JSON_BODY_LIMIT = '100mb';

const FILTER_TYPE = {
    BY_MASTER: 'filterByMaster',
    BY_CITY: 'filterByCity',
    BY_WATCH: 'filterByWatch',
    BY_STATUS: 'filterByStatus',
    BY_DATE: 'filterByDate'
};

module.exports = {
    ORDER_STATUS,
    USER_ROLES,
    ACCESS_SCOPE,
    MS_PER_HOUR,
    MIN_RATING_VALUE,
    MAX_RATING_VALUE,
    MAX_IMAGES_COUNT,
    MAX_IMAGE_SIZE_BYTES,
    JSON_BODY_LIMIT,
    FILTER_TYPE
};
