const { body, param, query, validationResult } = require('express-validator');
const { City } = require('../database/models');
const { Op } = require('sequelize');
const { RequireAuth } = require('../middleware/RouteProtector');
const {
    isDbErrorEntryNotFound,
    isDbErrorEntryAlreadyExists,
    isDbErrorEntryReferences,
    parseFilters,
    FILTER_OPERATORS
} = require('../utils');
const { ACCESS_SCOPE } = require('../constants');

const CITY_TYPE_DEF = { name: 'string', pricePerHour: 'number' };

const getSequelizeOperator = (operatorName) => {
    if (operatorName === 'contains') return [Op.contains];
    if (operatorName === 'equals') return [Op.eq];
    if (operatorName === 'startsWith') return [Op.startsWith];
    if (operatorName === 'endsWith') return [Op.endsWith];
};

/*const FILTER_OPERATORS = {
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
};*/

const buildWhereClause = (filters = []) => {
    const where = {};

    filters.forEach(({ field, operator, value }) => {
        console.log('buildWhereClause: ', field, operator, value);
        //govnokooood
        if (operator === 'contains') where[field] = { [Op.substring]: value };
        else if (['equals', 'eq'].includes(operator)) where[field] = { [Op.eq]: value };
        else if (operator === 'startsWith') where[field] = { [Op.startsWith]: value };
        else if (operator === 'endsWith') where[field] = { [Op.endsWith]: value };
        else if (operator === 'isEmpty') where[field] = { [Op.is]: null };
        else if (operator === 'isNotEmpty') where[field] = { [Op.not]: null };
        else if (operator === 'ne') where[field] = { [Op.ne]: value };
        else if (operator === 'gt') where[field] = { [Op.gt]: value };
        else if (operator === 'gte') where[field] = { [Op.gte]: value };
        else if (operator === 'lt') where[field] = { [Op.lt]: value };
        else if (operator === 'lte') where[field] = { [Op.lte]: value };
    });

    return where;
};

const getAll = [
    query('offset', 'offset value is incorrect').optional().isInt({ min: 0 }),
    query('limit', 'limit value is incorrect').optional().isInt({ min: 0 }),
    query('orderBy', 'orderBy value is incorrect').optional().isIn(['name', 'pricePerHour']),
    query('order', 'order value is incorrect').optional().toUpperCase().isIn(['ASC', 'DESC']),
    query('filter', 'filter value is incorrect')
        .optional()
        .custom((value, { req }) => {
            const filters = parseFilters(value, CITY_TYPE_DEF);
            const fields = filters.map((item) => item.field);
            return fields.includes('name') || fields.includes('pricePerHour');
        }),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { offset = 0, limit, orderBy, order = 'ASC', filter } = req.query;
            const sortParams = orderBy ? [orderBy, order] : ['createdAt', 'DESC'];
            const filters = parseFilters(filter, CITY_TYPE_DEF);
            //filters fields['pricePerHour'].value *= 100;
            const where = buildWhereClause(filters);
            console.log('where: ', where);

            const cities = await City.findAll({ where: { pricePerHour: { [Op.is]: null } }, order: [sortParams], limit, offset });
            const total = await City.count({ where });

            // Apply filters one by one
            /*filters.forEach((params) => {
                cities = cities.filter((item) => FILTER_OPERATORS[params.operator](item[params.field], params.value));
            });*/

            res.status(200).json({ cities, total }).end();
        } catch (error) {
            console.log(error);
            res.status(500).json(error).end();
        }
    }
];

const create = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    body('city').notEmpty().withMessage('city object required'),
    body('city.name')
        .exists()
        .withMessage('city.name required')
        .isString()
        .withMessage('city.name should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('empty city.name is not allowed'),
    body('city.pricePerHour')
        .exists()
        .withMessage('city.pricePerHour required')
        .isFloat()
        .withMessage('city.pricePerHour should be of decimal type')
        .custom((value, { req }) => {
            const pricePerHour = parseFloat(value);
            if (pricePerHour < 0.0) throw new Error('Invalid pricePerHour. Expected positive decimal value');
            return true;
        }),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { name, pricePerHour } = req.body.city;

            const city = await City.create({ name: name.trim(), pricePerHour: Number(pricePerHour) });
            res.status(201).json({ city }).end();
        } catch (error) {
            if (isDbErrorEntryAlreadyExists(error)) return res.status(409).json({ message: 'City already exists' }).end();

            res.status(500).json(error).end();
        }
    }
];

const remove = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('city id required').isUUID().withMessage('city id should be of type string'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;
            const result = await City.destroy({ where: { id } });
            if (!result) return res.status(404).json({ message: 'City not found' }).end();
            res.status(204).end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) return res.status(404).json({ message: 'City not found' }).end();

            if (isDbErrorEntryReferences(error)) {
                if (error.parent.constraint === 'master_city_list_cityId_fkey') {
                    return res.status(409).json({ message: 'Deletion restricted. Master(s) reference(s)' }).end();
                }

                if (error.parent.constraint === 'orders_cityId_fkey') {
                    return res.status(409).json({ message: 'Deletion restricted. Order(s) reference(s)' }).end();
                }
            }

            res.status(500).json(error).end();
        }
    }
];

const get = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('city id required').isUUID().withMessage('city id should be of type string'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;
            const city = await City.findOne({ where: { id } });
            if (!city) return res.status(404).json({ message: '~City not found~' }).end();

            res.status(200).json({ city }).end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) return res.status(404).json({ message: 'City not found' }).end();

            res.status(500).json(error).end();
        }
    }
];

const update = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('city id required').isUUID().withMessage('city id should be of type string'),
    body('city').notEmpty().withMessage('city object required'),
    body('city.name')
        .exists()
        .withMessage('city.name required')
        .isString()
        .withMessage('city.name should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty city.name is not allowed'),
    body('city.pricePerHour')
        .exists()
        .withMessage('city.pricePerHour required')
        .isFloat()
        .withMessage('city.pricePerHour should be of decimal type')
        .custom((value, { req }) => {
            const pricePerHour = parseFloat(value);
            if (pricePerHour < 0.0) throw new Error('Invalid pricePerHour. Expected positive decimal value');
            return true;
        }),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;
            const { name, pricePerHour } = req.body.city;

            const [affectedRows, result] = await City.update({ name: name.trim(), pricePerHour }, { where: { id }, returning: true });
            if (affectedRows === 0) return res.status(404).json({ message: 'City not found' }).end();

            res.status(200).json({ city: result[0] }).end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) return res.status(404).json({ message: 'City not found' }).end();
            if (isDbErrorEntryAlreadyExists(error)) return res.status(409).json({ message: 'City already exists' }).end();

            res.status(500).json(error).end();
        }
    }
];

module.exports = {
    getAll,
    create,
    remove,
    get,
    update
};
