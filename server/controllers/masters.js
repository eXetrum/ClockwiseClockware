const { RequireAuth } = require('../middleware/RouteProtector');
const { ACCESS_SCOPE, USER_ROLES } = require('../constants');
const { body, param, validationResult } = require('express-validator');
const { User, Master, City, MasterCityList, Order } = require('../database/models');
const db = require('../database/models/index');
const { isDbErrorEntryNotFound, isDbErrorEntryAlreadyExists, isDbErrorEntryReferences } = require('../utils');

const getAll = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    async (req, res) => {
        try {
            const records = await Master.findAll({
                include: [
                    {
                        model: User
                    },
                    { model: City, as: 'cities', through: { attributes: [] } },
                    { model: Order, as: 'orders' }
                ],
                attributes: { exclude: ['id', 'userId'] },
                order: [['createdAt', 'DESC']]
            });

            const masters = records.map((master) => ({ ...master.toJSON(), ...master.User.toJSON() }));

            res.status(200).json({ masters }).end();
        } catch (error) {
            res.status(400).json(error).end();
        }
    }
];

const create = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    body('master').notEmpty().withMessage('master object required'),
    body('master.name')
        .exists()
        .withMessage('master name required')
        .isString()
        .withMessage('master name should be of string type')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('empty master name is not allowed'),
    body('master.email')
        .exists()
        .withMessage('master email required')
        .isString()
        .withMessage('master email should be of string type')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('empty master email is not allowed')
        .isEmail()
        .withMessage('master email is not correct'),
    body('master.password')
        .exists()
        .withMessage('master password required')
        .isString()
        .withMessage('master password should be of string type')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('empty master password is not allowed'),
    body('master.rating')
        .exists()
        .withMessage('master rating required')
        .isNumeric()
        .withMessage('master rating should be of numeric value')
        .isInt({ min: 0, max: 5 })
        .withMessage('master rating must be in range [0; 5]'),
    body('master.isApprovedByAdmin')
        .exists()
        .withMessage('master isApprovedByAdmin field required')
        .isBoolean()
        .withMessage('master isApprovedByAdmin field should be of boolean type'),
    body('master.cities').exists().withMessage('master cities required').isArray().withMessage('master cities should be an array'),
    body('master.cities.*.id')
        .exists()
        .withMessage('each object of cities array should contains id field')
        .isString()
        .withMessage('city id should be of type string'),

    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { name, email, password, rating, isApprovedByAdmin } = req.body.master;
            let { cities } = req.body.master;

            const dbCities = await City.findAll();
            const dbCityIds = dbCities.map((city) => city.id);

            cities = cities.map((city) => city.id);
            // filter out id's which does not exists in the database
            cities = cities.filter((cityId) => dbCityIds.indexOf(cityId) !== -1);

            // Collect city 'model' objects
            const masterCities = [];
            cities.forEach((cityId) => {
                const dbCityObj = dbCities.find((city) => city.id === cityId);
                if (dbCityObj) masterCities.push(dbCityObj);
            });

            if (masterCities.length === 0) {
                return res.status(409).json({ message: 'master must be associated at least with one city' }).end();
            }

            const [user, details] = await db.sequelize.transaction(async (t) => {
                const user = await User.create(
                    { email: email.trim(), password: password.trim(), role: USER_ROLES.MASTER },
                    { transaction: t }
                );
                const details = await user.createMaster(
                    { name: name.trim(), rating, countOfReview: 1, isApprovedByAdmin },
                    { transaction: t }
                );
                await details.setCities(masterCities, { transaction: t });

                return [user, details];
            });

            cities = await details.getCities();
            res.status(201)
                .json({ master: { ...details.toJSON(), ...user.toJSON(), cities } })
                .end();
        } catch (error) {
            if (isDbErrorEntryAlreadyExists(error)) {
                return res.status(409).json({ message: 'User with specified email already exists' }).end();
            }

            res.status(400).json(error).end();
        }
    }
];

const remove = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().notEmpty().withMessage('master ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;

            await db.sequelize.transaction(async (t) => {
                const resultMasterDetails = await Master.destroy({ where: { userId: id } }, { transaction: t });
                const resultUserDetails = await User.destroy({ where: { id } }, { transaction: t });
                if (resultMasterDetails === 0 || resultUserDetails === 0) throw new Error('EntryNotFound');
            });

            res.status(204).end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) {
                return res.status(404).json({ message: 'Master not found' }).end();
            }

            if (isDbErrorEntryReferences(error)) {
                if (error.parent.constraint === 'master_city_list_masterId_fkey') {
                    return res.status(409).json({ message: 'Deletion restricted. Master contains reference(s) to city/cities' }).end();
                }
                if (error.parent.constraint === 'orders_masterId_fkey') {
                    return res.status(409).json({ message: 'Deletion restricted. Order(s) reference(s)' }).end();
                }
            }

            res.status(400).json(error).end();
        }
    }
];

const get = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().notEmpty().withMessage('master ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;

            const master = await Master.findOne({
                where: { userId: id },
                include: [{ model: User }, { model: City, as: 'cities', through: { attributes: [] } }],
                attributes: { exclude: ['id', 'userId'] }
            });

            if (!master) return res.status(404).json({ message: '~Master not found~' }).end();

            res.status(200)
                .json({ master: { ...master.toJSON(), ...master.User.toJSON() } })
                .end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) {
                return res.status(404).json({ message: 'Master not found' }).end();
            }

            res.status(400).json(error).end();
        }
    }
];

const update = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().notEmpty().withMessage('master ID required'),
    body('master').notEmpty().withMessage('master object required'),
    body('master.name')
        .exists()
        .withMessage('master name required')
        .isString()
        .withMessage('master name should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('empty master name is not allowed'),
    body('master.email')
        .exists()
        .withMessage('master email required')
        .isString()
        .withMessage('master email should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('empty master email is not allowed')
        .isEmail()
        .withMessage('master email is not correct'),
    body('master.rating')
        .exists()
        .withMessage('Master rating required')
        .isNumeric()
        .withMessage('Master rating should be of numeric value')
        .isInt({ min: 0, max: 5 })
        .withMessage('Master rating must be in range [0; 5]'),
    body('master.isApprovedByAdmin')
        .exists()
        .withMessage('master isApprovedByAdmin field required')
        .isBoolean()
        .withMessage('master isApprovedByAdmin field should be of boolean type'),
    body('master.cities').exists().withMessage('master cities required').isArray().withMessage('master cities should be an array'),
    body('master.cities.*.id')
        .exists()
        .withMessage('each object of cities array should contains id field')
        .isString()
        .withMessage('city id should be of type string'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;
            const { name, email, rating, isApprovedByAdmin } = req.body.master;
            let { cities } = req.body.master;

            const dbCities = await City.findAll();
            const dbCityIds = dbCities.map((city) => city.id);
            // master.cities contains id's now
            cities = cities.map((city) => city.id);
            // filter out id's which does not exists in the database, at this moment
            cities = cities.filter((cityId) => dbCityIds.indexOf(cityId) !== -1);

            // Collect city 'model' objects
            const masterCities = [];
            cities.forEach((cityId) => {
                const dbCityObj = dbCities.find((city) => city.id === cityId);
                if (dbCityObj) masterCities.push(dbCityObj);
            });

            if (masterCities.length === 0) {
                return res.status(409).json({ message: 'master must be associated at least with one city' }).end();
            }

            await db.sequelize.transaction(async (t) => {
                const [affectedRowsMaster, resultMaster] = await Master.update(
                    { name: name.trim(), rating, countOfReview: 1, isApprovedByAdmin },
                    {
                        where: { userId: id },
                        include: [{ model: City, as: 'cities', through: MasterCityList, required: true }],

                        returning: true,
                        limit: 1
                    },
                    { transaction: t }
                );
                if (affectedRowsMaster === 0) throw new Error('EntryNotFound');

                const [affectedRowsUser, resultUser] = await User.update(
                    { email: email.trim() },
                    { where: { id, role: USER_ROLES.MASTER }, returning: true, limit: 1 },
                    { transaction: t }
                );
                if (affectedRowsUser === 0) throw new Error('EntryNotFound');

                await resultMaster[0].setCities(masterCities, { transaction: t });
            });

            res.status(204).end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) return res.status(404).json({ message: 'Master not found' }).end();
            if (isDbErrorEntryAlreadyExists(error)) {
                return res.status(409).json({ message: 'User with specified email already exists' }).end();
            }

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
