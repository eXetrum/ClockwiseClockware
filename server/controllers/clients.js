const { RequireAuth } = require('../middleware/RouteProtector');
const { ACCESS_SCOPE } = require('../constants');
const { body, param, validationResult } = require('express-validator');
const db = require('../database/models/index');
const { User, Client, Order } = require('../database/models');

const getAll = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    async (req, res) => {
        try {
            const records = await Client.findAll({
                include: [
                    {
                        model: User
                    },
                    { model: Order, as: 'orders' }
                ],
                attributes: { exclude: ['id', 'userId'] },
                order: [['createdAt', 'DESC']]
            });
            const clients = records.map((client) => {
                const obj = {
                    ...client.toJSON(),
                    ...client.User.toJSON()
                };
                delete obj.User;
                return obj;
            });
            res.status(200).json({ clients }).end();
        } catch (e) {
            res.status(400).end();
        }
    }
];

const create = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    body('client').notEmpty().withMessage('client object required'),
    body('client.email')
        .exists()
        .withMessage('client email required')
        .isString()
        .withMessage('client email should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('empty client email is not allowed')
        .isEmail()
        .withMessage('client email is not correct'),
    body('client.name')
        .exists()
        .withMessage('client name required')
        .isString()
        .withMessage('client name should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('empty client name is not allowed'),
    body('client.password')
        .exists()
        .withMessage('client password required')
        .isString()
        .withMessage('client password should be of string type')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('empty client password is not allowed'),
    body('client.isActive')
        .exists()
        .withMessage('client isActive field required')
        .isBoolean()
        .withMessage('client isActive field should be of boolean type'),

    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { client } = req.body;

            client.email = client.email.trim();
            client.name = client.name.trim();
            client.password = client.password.trim();

            const user = await db.sequelize.transaction(async (t) => {
                const user = await User.create({ ...client, role: 'client' }, { transaction: t });
                const details = await user.createClient({ ...client }, { transaction: t });

                delete user.password;
                delete details.id;
                delete details.userId;

                return { ...details.toJSON(), ...user.toJSON() };
            });

            res.status(201).json({ client: user }).end();
        } catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ detail: 'User with specified email already exists' }).end();
            }

            res.status(400).end();
        }
    }
];

const remove = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().notEmpty().withMessage('Client ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;

            await db.sequelize.transaction(async (t) => {
                const resultClientDetails = await Client.destroy({ where: { userId: id } }, { transaction: t });
                const resultUserDetails = await User.destroy({ where: { id } }, { transaction: t });
                if (resultClientDetails === 0 || resultUserDetails === 0) throw new Error('ClientNotFound');
            });

            res.status(204).end();
        } catch (e) {
            // Incorrect UUID ID string
            if (
                (e.name === 'SequelizeDatabaseError' && e.parent && e.parent.routine === 'string_to_uuid') ||
                // Custom error that comes from transaction body
                (e.message && e.message === 'ClientNotFound')
            ) {
                return res.status(404).json({ detail: 'Client not found' }).end();
            }

            if (e.name === 'SequelizeForeignKeyConstraintError' && e.parent && e.parent.constraint) {
                if (e.parent.constraint === 'orders_clientId_fkey') {
                    return res.status(409).json({ detail: 'Deletion restricted. Order(s) reference(s)' }).end();
                }
            }

            res.status(400).end();
        }
    }
];

const get = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().notEmpty().withMessage('Client ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;

            let client = await Client.findOne({
                where: { userId: id },
                include: [{ model: User }],
                attributes: { exclude: ['id', 'userId'] }
            });
            if (!client) return res.status(404).json({ detail: '~Client not found~' }).end();

            client = {
                ...client.toJSON(),
                ...client.User.toJSON()
            };
            delete client.User;

            res.status(200).json({ client }).end();
        } catch (e) {
            // Incorrect UUID ID string
            if (e.name === 'SequelizeDatabaseError' && e.parent && e.parent.routine === 'string_to_uuid') {
                return res.status(404).json({ detail: 'Client not found' }).end();
            }

            res.status(400).end();
        }
    }
];

const update = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('client ID required').isUUID().withMessage('client ID should be of type string'),
    body('client').notEmpty().withMessage('client object required'),
    body('client.name')
        .exists()
        .withMessage('client name required')
        .isString()
        .withMessage('client name should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('empty client name is not allowed')
        .isLength({ min: 3 })
        .withMessage('client name must be at least 3 characters long'),
    body('client.email')
        .exists()
        .withMessage('client email required')
        .isString()
        .withMessage('client email should be of string type')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('empty client email is not allowed')
        .isEmail()
        .withMessage('client email is not correct'),
    body('client.isActive')
        .exists()
        .withMessage('client isActive field required')
        .isBoolean()
        .withMessage('client isActive field should be of boolean type'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const { client } = req.body;

            // Prepare data
            client.name = client.name.trim();
            client.email = client.email.trim();

            delete client.id;
            delete client.createdAt;
            delete client.updatedAt;

            await db.sequelize.transaction(async (t) => {
                const [affectedRowsClient, resultClient] = await Client.update(
                    client,
                    {
                        where: { userId: id },
                        returning: true,
                        limit: 1
                    },
                    { transaction: t }
                );
                if (affectedRowsClient === 0) throw new Error('ClientNotFound');

                const [affectedRowsUser, resultUser] = await User.update(
                    client,
                    { where: { id }, returning: true, limit: 1 },
                    { transaction: t }
                );
                if (affectedRowsUser === 0) throw new Error('ClientNotFound');
            });

            res.status(204).end();
        } catch (e) {
            // Incorrect UUID ID string
            if (
                (e.name === 'SequelizeDatabaseError' && e.parent && e.parent.routine === 'string_to_uuid') ||
                (e.message && e.message === 'ClientNotFound')
            ) {
                return res.status(404).json({ detail: 'Client not found' }).end();
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
