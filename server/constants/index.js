const USER_ROLES = Object.freeze({
    ADMIN: 'admin',
    MASTER: 'master',
    CLIENT: 'client'
});

const ACCESS_SCOPE = Object.freeze({
    AnyAuth: ['admin', 'master', 'client'],
    AdminOnly: ['admin'],
    MasterOnly: ['master'],
    ClientOnly: ['client'],
    AdminOrSelf: ['client', 'self']
});

module.exports = {
    USER_ROLES,
    ACCESS_SCOPE
};
