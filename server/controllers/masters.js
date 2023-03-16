const { RequireAuth } = require('../middleware/RouteProtector');
const { ACCESS_SCOPE } = require('../constants');
const { body, param, validationResult } = require('express-validator');
const { User, Master, City, MasterCityList, Order } = require('../database/models');
const db = require('../database/models/index');

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
                order: [['createdAt', 'DESC']]
            });

            const masters = records.map((master) => {
                const obj = {
                    ...master.toJSON(),
                    ...master.User.toJSON()
                };
                delete obj.User;
                delete obj.userId;

                return obj;
            });

            res.status(200).json({ masters }).end();
        } catch (e) {
            res.status(400).end();
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
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { master } = req.body;

            // Prepare data
            master.name = master.name.trim();
            master.email = master.email.trim();
            master.password = master.password.trim();
            delete master.isEmalVerified;
            delete master.isEnabled;

            const dbCities = await City.findAll();
            const dbCityIds = dbCities.map((city) => city.id);

            master.cities = master.cities.map((city) => city.id);
            // filter out id's which does not exists in the database
            master.cities = master.cities.filter((cityId) => dbCityIds.indexOf(cityId) !== -1);

            // Collect city 'model' objects
            const masterCities = [];
            master.cities.forEach((cityId) => {
                const dbCityObj = dbCities.find((city) => city.id === cityId);
                if (dbCityObj) masterCities.push(dbCityObj);
            });

            const [user, details] = await db.sequelize.transaction(async (t) => {
                const user = await User.create({ ...master, role: 'master' }, { transaction: t });
                const details = await user.createMaster({ ...master }, { transaction: t });
                await details.setCities(masterCities, { transaction: t });

                delete user.password;
                delete details.id;
                delete details.userId;

                return [{ ...details.toJSON(), ...user.toJSON() }, details];
            });

            user.cities = await details.getCities();
            res.status(201).json({ master: user }).end();
        } catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ detail: 'User with specified email already exists' }).end();
            }

            res.status(400).json(e).end();
        }
    }
];

const remove = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().notEmpty().withMessage('master ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;

            await db.sequelize.transaction(async (t) => {
                const resultMasterDetails = await Master.destroy({ where: { userId: id } }, { transaction: t });
                const resultUserDetails = await User.destroy({ where: { id } }, { transaction: t });
                if (resultMasterDetails === 0 || resultUserDetails === 0) throw new Error('MasterNotFound');
            });

            res.status(204).end();
        } catch (e) {
            // Incorrect UUID ID string
            if (
                (e.name === 'SequelizeDatabaseError' && e.parent && e.parent.routine === 'string_to_uuid') ||
                (e.message && e.message === 'MasterNotFound')
            ) {
                return res.status(404).json({ detail: 'Master not found' }).end();
            }

            if (e.name === 'SequelizeForeignKeyConstraintError' && e.parent) {
                if (e.parent.constraint === 'master_city_list_masterId_fkey') {
                    return res.status(409).json({ detail: 'Deletion restricted. Master contains reference(s) to city/cities' }).end();
                }
                if (e.parent.constraint === 'orders_masterId_fkey') {
                    return res.status(409).json({ detail: 'Deletion restricted. Order(s) reference(s)' }).end();
                }
            }

            res.status(400).end();
        }
    }
];

const get = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().notEmpty().withMessage('master ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;

            let master = await Master.findOne({
                where: { userId: id },
                include: [{ model: User }, { model: City, as: 'cities', through: { attributes: [] } }],
                attributes: { exclude: ['id', 'userId'] }
            });

            if (!master) return res.status(404).json({ detail: '~Master not found~' }).end();

            master = {
                ...master.toJSON(),
                ...master.User.toJSON()
            };
            delete master.User;

            res.status(200).json({ master }).end();
        } catch (e) {
            // Incorrect UUID ID string
            if (e.name === 'SequelizeDatabaseError' && e.parent && e.parent.routine === 'string_to_uuid') {
                return res.status(404).json({ detail: 'Master not found' }).end();
            }

            res.status(400).end();
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
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const { master } = req.body;

            // Prepare data
            master.name = master.name.trim();
            master.email = master.email.trim();
            delete master.isEmalVerified;
            delete master.isEnabled;

            const dbCities = await City.findAll();
            const dbCityIds = dbCities.map((city) => city.id);
            // master.cities contains id's now
            master.cities = master.cities.map((city) => city.id);
            // filter out id's which does not exists in the database, at this moment
            master.cities = master.cities.filter((cityId) => dbCityIds.indexOf(cityId) !== -1);

            // Collect city 'model' objects
            const masterCities = [];
            master.cities.forEach((cityId) => {
                const dbCityObj = dbCities.find((city) => city.id === cityId);
                if (dbCityObj) masterCities.push(dbCityObj);
            });

            delete master.id;
            delete master.createdAt;
            delete master.updatedAt;

            await db.sequelize.transaction(async (t) => {
                const [affectedRowsMaster, resultMaster] = await Master.update(
                    master,
                    {
                        where: { userId: id },
                        include: [{ model: City, as: 'cities', through: MasterCityList, required: true }],

                        returning: true,
                        limit: 1
                    },
                    { transaction: t }
                );
                if (affectedRowsMaster === 0) throw new Error('MasterNotFound');

                const [affectedRowsUser, resultUser] = await User.update(
                    master,
                    { where: { id, role: 'master' }, returning: true, limit: 1 },
                    { transaction: t }
                );
                if (affectedRowsUser === 0) throw new Error('MasterNotFound');

                await resultMaster[0].setCities(masterCities, { transaction: t });
            });

            res.status(204).end();
        } catch (e) {
            // Incorrect UUID ID string
            if (
                (e.name === 'SequelizeDatabaseError' && e.parent && e.parent.routine === 'string_to_uuid') ||
                (e.message && e.message === 'MasterNotFound')
            ) {
                return res.status(404).json({ detail: 'Master not found' }).end();
            }

            if (e.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ detail: 'User with specified email already exists' }).end();
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
