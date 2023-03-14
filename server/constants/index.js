const USER_ROLES = Object.freeze({
    ADMIN: 'admin',
    MASTER: 'master',
    CLIENT: 'client'
});

const ACCESS_SCOPE = Object.freeze({
    AnyAuth: [USER_ROLES.ADMIN, USER_ROLES.MASTER, USER_ROLES.CLIENT],
    AdminOnly: [USER_ROLES.ADMIN],
    MasterOnly: [USER_ROLES.MASTER],
    ClientOnly: [USER_ROLES.CLIENT],
    MasterOrClient: [USER_ROLES.MASTER, USER_ROLES.CLIENT]
});

module.exports = {
    USER_ROLES,
    ACCESS_SCOPE
};
