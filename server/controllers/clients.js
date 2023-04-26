const { body, param, query, validationResult } = require('express-validator');
const { Sequelize } = require('sequelize');
const db = require('../database/models/index');
const { User, Client, Order } = require('../database/models');
const { RequireAuth } = require('../middleware/RouteProtector');
const { isDbErrorEntryNotFound, isDbErrorEntryAlreadyExists, isDbErrorEntryReferences } = require('../utils');
const { ACCESS_SCOPE, USER_ROLES } = require('../constants');

const getAll = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    query('offset', 'offset value is incorrect').optional().isInt({ min: 0 }),
    query('limit', 'limit value is incorrect ').optional().isInt({ min: 0 }),
    query('orderBy', 'orderBy value is incorrect ').optional().isIn(['email', 'name', 'isEmailVerified']),
    query('order', 'order value is incorrect ').optional().toUpperCase().isIn(['ASC', 'DESC']),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { offset = 0, limit, orderBy, order = 'ASC' } = req.query;
            const sortParams = orderBy ? [orderBy, order] : ['createdAt', 'DESC'];
            if (orderBy === 'email') sortParams[0] = Sequelize.literal('"User.email"');

            const records = await Client.findAll({
                include: [
                    { model: User, required: true },
                    { model: Order, as: 'orders' }
                ],
                attributes: { exclude: ['id'] },
                order: [sortParams],
                limit,
                offset
            });
            const total = await Client.count({ include: [{ model: User, required: true }] });

            const clients = records.map((client) => ({ ...client.toJSON(), ...client.User.toJSON() }));
            res.status(200).json({ clients, total }).end();
        } catch (error) {
            res.status(500).json(error).end();
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

    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { email, password, name } = req.body.client;

            const client = await db.sequelize.transaction(async (t) => {
                const user = await User.create(
                    { email: email.trim(), password: password.trim(), role: USER_ROLES.CLIENT },
                    { transaction: t }
                );
                const details = await user.createClient({ name: name.trim() }, { transaction: t });

                const { id, userId, ...clientDetails } = details.toJSON();
                return { ...clientDetails, ...user.toJSON() };
            });

            res.status(201).json({ client }).end();
        } catch (error) {
            if (isDbErrorEntryAlreadyExists(error)) {
                return res.status(409).json({ message: 'User with specified email already exists' }).end();
            }

            res.status(500).json(error).end();
        }
    }
];

const remove = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('client id required').isUUID().withMessage('client id should be of type string'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;

            await db.sequelize.transaction(async (t) => {
                const resultClientDetails = await Client.destroy({ where: { userId: id } }, { transaction: t });
                const resultUserDetails = await User.destroy({ where: { id } }, { transaction: t });
                if (resultClientDetails === 0 || resultUserDetails === 0) throw new Error('EntryNotFound');
            });

            res.status(204).end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) return res.status(404).json({ message: 'Client not found' }).end();
            if (isDbErrorEntryReferences(error) && error.parent.constraint === 'orders_clientId_fkey') {
                return res.status(409).json({ message: 'Deletion restricted. Order(s) reference(s)' }).end();
            }

            res.status(500).json(error).end();
        }
    }
];

const get = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('client id required').isUUID().withMessage('client id should be of type string'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;

            const client = await Client.findOne({
                where: { userId: id },
                include: [{ model: User }],
                attributes: { exclude: ['id', 'userId'] }
            });
            if (!client) return res.status(404).json({ message: '~Client not found~' }).end();

            res.status(200)
                .json({ client: { ...client.toJSON(), ...client.User.toJSON() } })
                .end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) return res.status(404).json({ message: 'Client not found' }).end();

            res.status(500).json(error).end();
        }
    }
];

const update = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('client id required').isUUID().withMessage('client id should be of type string'),
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
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;
            const { name, email } = req.body.client;

            const [client, details] = await db.sequelize.transaction(async (t) => {
                const [affectedRowsClient, resultClient] = await Client.update(
                    { name: name.trim() },
                    {
                        where: { userId: id },
                        returning: true,
                        limit: 1
                    },
                    { transaction: t }
                );
                if (affectedRowsClient === 0) throw new Error('EntryNotFound');

                const [affectedRowsUser, resultUser] = await User.update(
                    { email: email.trim() },
                    { where: { id }, returning: true, limit: 1 },
                    { transaction: t }
                );
                if (affectedRowsUser === 0) throw new Error('EntryNotFound');

                return [resultClient[0], resultUser[0]];
            });

            res.status(200)
                .json({ client: { ...client.toJSON(), ...details.toJSON() } })
                .end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) return res.status(404).json({ message: 'Client not found' }).end();
            if (isDbErrorEntryAlreadyExists(error)) {
                return res.status(409).json({ message: 'User with specified email already exists' }).end();
            }

            res.status(500).end();
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
