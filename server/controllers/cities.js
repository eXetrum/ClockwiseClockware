const { RouteProtector } = require('../middleware/RouteProtector');
const { body, param, validationResult } = require('express-validator');
const { City } = require('../database/models');

const getAll = async (req, res) => {
    try {
        const cities = await City.findAll({ order: [['updatedAt', 'DESC']] });
        res.status(200).json({ cities }).end();
    } catch (e) {
        res.status(400).end();
    }
};

const create = [
    RouteProtector,
    body('city').notEmpty().withMessage('City object required'),
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
        .isDecimal()
        .withMessage('city.pricePerHour should be of decimal type')
        .custom((value, { req }) => {
            const pricePerHour = parseFloat(value);
            if (pricePerHour < 0.0) throw new Error('Invalid pricePerHour. Expected positive decimal value');
            return true;
        }),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            let { city } = req.body;
            city.name = city.name.trim();

            city = await City.create({ ...city });
            res.status(201).json({ city }).end();
        } catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ detail: 'City already exists' }).end();

            res.status(400).json(e).end();
        }
    }
];

const remove = [
    RouteProtector,
    param('id').exists().notEmpty().withMessage('City ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const result = await City.destroy({ where: { id } });
            if (!result) return res.status(404).json({ detail: 'City not found' }).end();
            res.status(204).end();
        } catch (e) {
            // Incorrect UUID ID string
            if (e.name === 'SequelizeDatabaseError' && e.parent && e.parent.routine === 'string_to_uuid') {
                return res.status(404).json({ detail: 'City not found' }).end();
            }

            if (e.name === 'SequelizeForeignKeyConstraintError' && e.parent) {
                if (e.parent.constraint === 'master_city_list_cityId_fkey') {
                    return res.status(409).json({ detail: 'Deletion restricted. Master(s) reference(s)' }).end();
                }

                if (e.parent.constraint === 'orders_cityId_fkey') {
                    return res.status(409).json({ detail: 'Deletion restricted. Order(s) reference(s)' }).end();
                }
            }

            res.status(400).end();
        }
    }
];

const get = [
    RouteProtector,
    param('id').exists().notEmpty().withMessage('City ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const city = await City.findOne({ where: { id } });
            if (!city) return res.status(404).json({ detail: '~City not found~' }).end();

            res.status(200).json({ city }).end();
        } catch (e) {
            // Incorrect UUID ID string
            if (e.name === 'SequelizeDatabaseError' && e.parent && e.parent.routine === 'string_to_uuid') {
                return res.status(404).json({ detail: 'City not found' }).end();
            }

            res.status(400).end();
        }
    }
];

const update = [
    RouteProtector,
    body('city').notEmpty().withMessage('City object required'),
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
        .isDecimal()
        .withMessage('city.pricePerHour should be of decimal type')
        .custom((value, { req }) => {
            const pricePerHour = parseFloat(value);
            if (pricePerHour < 0.0) throw new Error('Invalid pricePerHour. Expected positive decimal value');
            return true;
        }),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const { city } = req.body;
            city.name = city.name.trim();

            const [affectedRows, result] = await City.update({ ...city }, { where: { id }, returning: true });
            if (affectedRows === 0) return res.status(404).json({ detail: 'City not found' }).end();

            res.status(204).end();
        } catch (e) {
            // Incorrect UUID ID string
            if (e.name === 'SequelizeDatabaseError' && e.parent && e.parent.routine === 'string_to_uuid') {
                return res.status(404).json({ detail: 'City not found' }).end();
            }

            // City already exists
            if (e.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ detail: 'City already exists' }).end();

            res.status(400).end();
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
