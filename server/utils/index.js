require('dotenv').config();
const { Op } = require('sequelize');
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

function customTrim(str, charToRemove) {
    let start = 0;
    let end = str.length - 1;

    while (start <= end && str.charAt(start) === charToRemove) {
        start++;
    }

    while (end >= start && str.charAt(end) === charToRemove) {
        end--;
    }

    return str.substring(start, end + 1);
}

const getValueByTypeName = (typeName, operator, value) => {
    if (typeName === 'string') return String(value);
    if (typeName === 'number') return Number(value);
    if (typeName === 'boolean') return Boolean(value === 'true');
    if (typeName === 'dateTime') {
        if (operator === 'between') {
            const [start, end] = value.split('->');
            return [Number(start), Number(end)];
        }
        return Number(value);
    }

    return value;
};

const parseFilters = (filtersStr = '', columnTypeDef = {}) => {
    const columnRegex = /(?:"[^"]*"|[^&])+(?:&+$)?/g;
    const paramsRegex = /(".*?(?<!\\)"|[^->\s]+)(?=\s*->|$)/g;

    const query = decodeURIComponent(filtersStr);
    const columns = query.match(columnRegex) || [];
    const validColumns = Object.keys(columnTypeDef);
    const result = [];
    columns.forEach((col) => {
        const params = col.match(paramsRegex) || [];
        if ([2, 3].includes(params.length)) {
            let [field, operator, value] = params;
            if (value === undefined) throw new Error();

            if (validColumns.includes(field)) {
                const idx = result.map((item) => item.field).indexOf(field);
                value = customTrim(value, '"');
                value = getValueByTypeName(columnTypeDef[field], operator, value);

                if (idx === -1) {
                    result.push({ field, operator, value });
                } else {
                    result[idx] = { field, operator, value };
                }
            }
        }
    });
    return result;
};

const buildWhereClause = (filters = []) => {
    const where = {};
    filters.forEach(({ field, operator, value }) => {
        if (operator === 'contains') where[field] = { [Op.substring]: value };
        else if (['equals', 'eq'].includes(operator)) where[field] = { [Op.eq]: value };
        else if (operator === 'startsWith') where[field] = { [Op.startsWith]: value };
        else if (operator === 'endsWith') where[field] = { [Op.endsWith]: value };
        else if (operator === 'ne') where[field] = { [Op.ne]: value };
        else if (operator === 'gt') where[field] = { [Op.gt]: value };
        else if (operator === 'gte') where[field] = { [Op.gte]: value };
        else if (operator === 'lt') where[field] = { [Op.lt]: value };
        else if (operator === 'lte') where[field] = { [Op.lte]: value };
        else if (operator === 'is') where[field] = { [Op.is]: value };
        else if (operator === 'between') where[field] = { [Op.between]: value };
    });
    return where;
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
    buildWhereClause
};
