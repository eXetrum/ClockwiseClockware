const { body, param, validationResult } = require('express-validator');
const { City } = require('../database/models');
const { RequireAuth } = require('../middleware/RouteProtector');
const { isDbErrorEntryNotFound, isDbErrorEntryAlreadyExists, isDbErrorEntryReferences } = require('../utils');
const { ACCESS_SCOPE } = require('../constants');

const getAll = async (req, res) => {
    try {
        const cities = await City.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json({ cities }).end();
    } catch (error) {
        res.status(400).json(error).end();
    }
};

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
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { name, pricePerHour } = req.body.city;

            const city = await City.create({ name: name.trim(), pricePerHour });
            res.status(201).json({ city }).end();
        } catch (error) {
            if (isDbErrorEntryAlreadyExists(error)) return res.status(409).json({ message: 'City already exists' }).end();

            res.status(400).json(error).end();
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

            res.status(400).json(error).end();
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

            res.status(400).json(error).end();
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
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;
            const { name, pricePerHour } = req.body.city;

            const [affectedRows, result] = await City.update({ name: name.trim(), pricePerHour }, { where: { id }, returning: true });
            if (affectedRows === 0) return res.status(404).json({ message: 'City not found' }).end();

            res.status(204).end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) return res.status(404).json({ message: 'City not found' }).end();
            if (isDbErrorEntryAlreadyExists(error)) return res.status(409).json({ message: 'City already exists' }).end();

            res.status(400).json(error).end();
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
