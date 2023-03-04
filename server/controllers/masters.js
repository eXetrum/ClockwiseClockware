const { RouteProtector } = require('../middleware/RouteProtector');
const { body, param, validationResult } = require('express-validator');
const { Master, City, Order, MasterCityList } = require('../database/models');
const db = require('../database/models/index');

const getAll = [
    RouteProtector,
    async (req, res) => {
        try {
            const masters = await Master.findAll({
                include: [
                    { model: City, as: 'cities', through: { attributes: [] } },
                    { model: Order, as: 'orders' }
                ],
                order: [['updatedAt', 'DESC']]
            });
            res.status(200).json({ masters }).end();
        } catch (e) {
            console.log(e);
            res.status(400).end();
        }
    }
];

const create = [
    RouteProtector,
    body('master').notEmpty().withMessage('Master object required'),
    body('master.name')
        .exists()
        .withMessage('Master name required')
        .isString()
        .withMessage('Master name should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty master name is not allowed'),
    body('master.email')
        .exists()
        .withMessage('Master email required')
        .isString()
        .withMessage('Master email should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty master email is not allowed')
        .isEmail()
        .withMessage('Master email is not correct'),
    body('master.rating')
        .exists()
        .withMessage('Master rating required')
        .isNumeric()
        .withMessage('Master rating should be of numeric value')
        .isInt({ min: 0, max: 5 })
        .withMessage('Master rating must be in range [0; 5]'),
    body('master.cities').exists().withMessage('Master cities required').isArray().withMessage('Master cities should be an array'),
    body('master.cities.*.id')
        .exists()
        .withMessage('Each object of cities array should contains id field')
        .isString()
        .withMessage('city id should be of type string'),

    async (req, res) => {
        let transaction = null;
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            let { master } = req.body;

            // Prepare data
            master.name = master.name.trim();
            master.email = master.email.trim();

            const dbCities = await City.findAll();
            const dbCityIds = dbCities.map((city) => city.id);

            master.cities = master.cities.map((city) => city.id);
            // filter out id's which does not exists in the database
            master.cities = master.cities.filter((cityId) => dbCityIds.indexOf(cityId) != -1);

            // Collect city 'model' objects
            const masterCities = [];
            master.cities.forEach((cityId) => {
                const dbCityObj = dbCities.find((city) => city.id == cityId);
                if (dbCityObj) masterCities.push(dbCityObj);
            });

            transaction = await db.sequelize.transaction();
            const result = await Master.create(master, { transaction });
            await result.setCities(masterCities, { transaction });
            await transaction.commit();

            master = result.toJSON();
            master.cities = await result.getCities();
            res.status(201).json({ master }).end();
        } catch (e) {
            console.log(e);
            if (transaction) {
                await transaction.rollback();
            }

            if (e.name == 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ detail: 'Master with specified email already exists' }).end();
            }

            res.status(400).json(e).end();
        }
    }
];

const remove = [
    RouteProtector,
    param('id').exists().notEmpty().withMessage('Master ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const result = await Master.destroy({ where: { id } });
            if (result === 0) return res.status(404).json({ detail: 'Master not found' }).end();
            res.status(204).end();
        } catch (e) {
            console.log(e);

            // Incorrect UUID ID string
            if (e.name == 'SequelizeDatabaseError' && e.parent && e.parent.routine == 'string_to_uuid') {
                return res.status(404).json({ detail: 'Master not found' }).end();
            }

            if (e.name == 'SequelizeForeignKeyConstraintError' && e.parent) {
                if (e.parent.constraint == 'master_city_list_masterId_fkey') {
                    return res.status(409).json({ detail: 'Deletion restricted. Master contains reference(s) to city/cities' }).end();
                }
                if (e.parent.constraint == 'orders_masterId_fkey') {
                    return res.status(409).json({ detail: 'Deletion restricted. Order(s) reference(s)' }).end();
                }
            }

            res.status(400).end();
        }
    }
];

const get = [
    RouteProtector,
    param('id').exists().notEmpty().withMessage('Master ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const master = await Master.findOne({
                where: { id },
                include: { model: City, as: 'cities', through: { attributes: [] } }
            });

            if (!master) return res.status(404).json({ detail: 'Master not found' }).end();
            res.status(200).json({ master }).end();
        } catch (e) {
            console.log(e);
            // Incorrect UUID ID string
            if (e.name == 'SequelizeDatabaseError' && e.parent && e.parent.routine == 'string_to_uuid') {
                return res.status(404).json({ detail: 'Master not found' }).end();
            }

            res.status(400).end();
        }
    }
];

const update = [
    RouteProtector,
    param('id').exists().notEmpty().withMessage('Master ID required'),
    body('master').notEmpty().withMessage('Master object required'),
    body('master.name')
        .exists()
        .withMessage('Master name required')
        .isString()
        .withMessage('Master name should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty master name is not allowed'),
    body('master.email')
        .exists()
        .withMessage('Master email required')
        .isString()
        .withMessage('Master email should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty master email is not allowed')
        .isEmail()
        .withMessage('Master email is not correct'),
    body('master.rating')
        .exists()
        .withMessage('Master rating required')
        .isNumeric()
        .withMessage('Master rating should be of numeric value')
        .isInt({ min: 0, max: 5 })
        .withMessage('Master rating must be in range [0; 5]'),
    body('master.cities').exists().withMessage('Master cities required').isArray().withMessage('Master cities should be an array'),
    body('master.cities.*.id')
        .exists()
        .withMessage('Each object of cities array should contains id field')
        .isString()
        .withMessage('city id should be of type string'),
    async (req, res) => {
        let transaction = null;
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const { master } = req.body;

            // Prepare data
            master.name = master.name.trim();
            master.email = master.email.trim();

            const dbCities = await City.findAll();
            const dbCityIds = dbCities.map((city) => city.id);
            // master.cities contains id's now
            master.cities = master.cities.map((city) => city.id);
            // filter out id's which does not exists in the database, at this moment
            master.cities = master.cities.filter((cityId) => dbCityIds.indexOf(cityId) != -1);

            // Collect city 'model' objects
            const masterCities = [];
            master.cities.forEach((cityId) => {
                const dbCityObj = dbCities.find((city) => city.id == cityId);
                if (dbCityObj) masterCities.push(dbCityObj);
            });

            transaction = await db.sequelize.transaction();
            let [affectedRows, result] = await Master.update(master, { where: { id }, returning: true, limit: 1 });

            if (!affectedRows) return res.status(404).json({ detail: '~Master not found~' }).end();

            result = result[0];
            await result.setCities(masterCities, { transaction });
            await transaction.commit();

            res.status(204).end();
        } catch (e) {
            console.log(e);
            if (transaction) {
                await transaction.rollback();
            }

            // Incorrect UUID ID string
            if (e.name == 'SequelizeDatabaseError' && e.parent && e.parent.routine == 'string_to_uuid') {
                return res.status(404).json({ detail: 'Master not found' }).end();
            }

            if (e.name == 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ detail: 'Master with specified email already exists' }).end();
            }

            res.status(400).json(e).end();
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
