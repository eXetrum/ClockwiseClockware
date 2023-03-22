require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Entropy, charset64 } = require('entropy-string');

const { MS_PER_HOUR } = require('../constants');

const hashPassword = async (plaintextPassword) => {
    const hash = await bcrypt.hash(plaintextPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    return hash;
};

const compareSync = (plaintextPassword, hash) => bcrypt.compareSync(plaintextPassword, hash);

const dateToNearestHour = (timestamp) => Math.ceil(timestamp / MS_PER_HOUR) * MS_PER_HOUR;

const generatePassword = () => {
    const entropy = new Entropy({ total: 1e10, risk: 1e12 });
    return entropy.string();
};

const generateConfirmationToken = () => {
    const entropy = new Entropy({ total: 1e10, risk: 1e12, charset: charset64 });
    return entropy.string();
};

const isDbErrorEntryNotFound = (error) =>
    (error.name === 'SequelizeDatabaseError' && error.parent && error.parent.routine === 'string_to_uuid') ||
    (error.message && error.message === 'EntryNotFound');
const isDbErrorEntryAlreadyExists = (error) => error.name === 'SequelizeUniqueConstraintError';
const isDbErrorEntryReferences = (error) => error.name === 'SequelizeForeignKeyConstraintError' && error.parent;

module.exports = {
    hashPassword,
    compareSync,
    generatePassword,
    generateConfirmationToken,
    dateToNearestHour,
    isDbErrorEntryNotFound,
    isDbErrorEntryAlreadyExists,
    isDbErrorEntryReferences
};
