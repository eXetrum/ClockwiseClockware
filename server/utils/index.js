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

const FILTER_OPERATORS = {
    // Strings
    contains: (str, text) => str.toLowerCase().includes(text.toLowerCase()),
    equals: (str, text) => str.toLowerCase() === text.toLowerCase(),
    startsWith: (str, text) => str.toLowerCase().startsWith(text.toLowerCase()),
    endsWith: (str, text) => str.toLowerCase().endsWith(text.toLowerCase()),
    // Shared, without params
    isEmpty: (str, _) => str.length === 0,
    isNotEmpty: (str, _) => str.length !== 0,
    // Numeric
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    gt: (a, b) => a > b,
    gte: (a, b) => a >= b,
    lt: (a, b) => a < b,
    lte: (a, b) => a <= b,
    // Boolean/Datetime
    is: (a, b) => a.valueOf() === b.valueOf(),
    isNot: (a, b) => a.valueOf() !== b.valueOf(),
    // Datetime
    isAfter: (a, b) => a.valueOf() > b.valueOf(),
    isOnOrAfter: (a, b) => a.valueOf() >= b.valueOf(),
    isBefore: (a, b) => a.valueOf() < b.valueOf(),
    isOnOrBefore: (a, b) => a.valueOf() <= b.valueOf(),
    isInBetween: (a, b) => false // TODO
};

const OPERATORS_WITHOUT_QUERY = ['isEmpty', 'isNotEmpty'];

const getValueByTypeName = (typeName, value) => {
    if (typeName === 'string') return String(value);
    if (typeName === 'number') return Number(value);
    if (typeName === 'boolean') return Boolean(value === 'true');

    return value;
};

const parseFilters = (filtersStr = '', columnTypeDef = {}) => {
    const columnRegex = /(?:"[^"]*"|[^&])+(?:&+$)?/g;
    const paramsRegex = /(?:"[^"]*"|[^(->)])+(?:(->)+$)?/g;
    //
    //{ name: 'string', pricePerHour: 'number' }

    const query = decodeURIComponent(filtersStr);
    const columns = query.match(columnRegex) || [];
    console.log('parseFilters: columns=', columns);
    const validColumns = Object.keys(columnTypeDef);
    const result = [];
    columns.forEach((col) => {
        const params = col.match(paramsRegex) || [];
        if ([2, 3].includes(params.length)) {
            let [field, operator, value] = params;
            if (!OPERATORS_WITHOUT_QUERY.includes(operator) && value === undefined) throw new Error();

            if (validColumns.includes(field)) {
                const idx = result.map((item) => item.field).indexOf(field);
                try {
                    value = JSON.parse(value.trim('"'));
                } catch {}

                value =
                    field in columnTypeDef && !OPERATORS_WITHOUT_QUERY.includes(operator)
                        ? getValueByTypeName(columnTypeDef[field], value)
                        : value;

                if (idx === -1) {
                    result.push({ field, operator, value });
                } else {
                    result[idx] = { field, operator, value };
                }
            }
        }
    });
    console.log('parseFilters result=', result);
    return result;
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
    parseFilters,
    FILTER_OPERATORS
};
