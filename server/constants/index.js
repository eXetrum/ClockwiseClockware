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
    MasterOrClient: [USER_ROLES.MASTER, USER_ROLES.CLIENT]
};

const MS_PER_HOUR = 60 * 60 * 1000;

module.exports = {
    USER_ROLES,
    ACCESS_SCOPE,
    MS_PER_HOUR
};
