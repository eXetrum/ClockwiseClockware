require('dotenv').config();
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { Entropy, charset64 } = require('entropy-string');
const { validate } = require('uuid');
const { MS_PER_HOUR, ORDER_STATUS, FILTER_TYPE } = require('../constants');

const hashPassword = async (plaintextPassword) => {
    const hash = await bcrypt.hash(plaintextPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    return hash;
};

const compareSync = (plaintextPassword, hash) => bcrypt.compareSync(plaintextPassword, hash);

const dateToNearestHour = (timestamp) => Math.ceil(timestamp / MS_PER_HOUR) * MS_PER_HOUR;

const formatDecimal = (value, precision = 2) => parseFloat(value).toFixed(precision);

const pad = (num) => num.toString().padStart(2, '0');
const formatDate = (value) => {
    const date = new Date(value);
    return (
        [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
        ' ' +
        [pad(date.getHours()), pad(date.getMinutes())].join(':')
    );
};

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

const compareASC = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const compareDESC = (a, b) => (a < b ? 1 : a > b ? -1 : 0);

const createComparatorByProp =
    (propName, ASC = true) =>
    (a, b) =>
        ASC ? compareASC(a[propName], b[propName]) : compareDESC(a[propName], b[propName]);

const customTrim = (str, charToRemove) => {
    let start = 0;
    let end = str.length - 1;
    while (start <= end && str.charAt(start) === charToRemove) start++;
    while (end >= start && str.charAt(end) === charToRemove) end--;
    return str.substring(start, end + 1);
};

const onlyUnique = (value, index, array) => array.indexOf(value) === index;

const sanitizeArgsByFilterType = (filterName, args) => {
    if ([FILTER_TYPE.BY_MASTER, FILTER_TYPE.BY_CITY, FILTER_TYPE.BY_WATCH].includes(filterName)) {
        return Array.isArray(args) && args.filter(onlyUnique).filter((item) => validate(item));
    }

    if (filterName === FILTER_TYPE.BY_STATUS) {
        return Array.isArray(args) && args.filter(onlyUnique).filter((item) => Object.values(ORDER_STATUS).includes(item));
    }

    if (filterName === FILTER_TYPE.BY_DATE) {
        return Array.isArray(args) &&
            args.length === 2 &&
            args.filter((item) => item !== null).length &&
            args.filter((item) => item === null || Number.isInteger(item))
            ? args
            : [];
    }
    return [];
};

const parseFilters = (filtersJSON = '') => {
    try {
        const validFilterKeys = Object.values(FILTER_TYPE);
        const query = decodeURIComponent(filtersJSON);
        const inputFilters = JSON.parse(query);
        if (!Array.isArray(inputFilters)) return {};

        // Drop unknown filter type(s), filters without args
        const where = {};
        validFilterKeys.forEach((filterType) => {
            // Should be valid filter name
            const idx = inputFilters.findIndex((item) => filterType in item);
            if (idx !== -1) {
                // Expected array of args
                if (Array.isArray(inputFilters[idx][filterType]) && inputFilters[idx][filterType].length) {
                    const args = sanitizeArgsByFilterType(filterType, inputFilters[idx][filterType]);
                    // Filters without args is not allowed
                    if (args.length) {
                        if (filterType === FILTER_TYPE.BY_MASTER) where['$master.userId$'] = { [Op.in]: args };
                        if (filterType === FILTER_TYPE.BY_CITY) where['$city.id$'] = { [Op.in]: args };
                        if (filterType === FILTER_TYPE.BY_WATCH) where['$watch.id$'] = { [Op.in]: args };
                        if (filterType === FILTER_TYPE.BY_STATUS) where['status'] = { [Op.in]: args };
                        if (filterType === FILTER_TYPE.BY_DATE) {
                            const [start, end] = args;
                            if (start !== null && end !== null) where['startDate'] = { [Op.between]: [Number(start), Number(end)] };
                            else if (start !== null) where['startDate'] = { [Op.gte]: Number(start) };
                            else if (end !== null) where['startDate'] = { [Op.lte]: Number(end) };
                        }
                    }
                }
            }
        });
        return where;
    } catch {
        return {};
    }
};

module.exports = {
    hashPassword,
    compareSync,
    generatePassword,
    generateConfirmationToken,
    dateToNearestHour,
    isDbErrorEntryNotFound,
    isDbErrorEntryAlreadyExists,
    isDbErrorEntryReferences,
    formatDecimal,
    formatDate,
    createComparatorByProp,
    customTrim,
    onlyUnique,
    parseFilters
};
