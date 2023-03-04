const { RouteProtector } = require('../middleware/RouteProtector');
const { body, param, validationResult } = require('express-validator');
const { Client, Order } = require('../database/models');

const getAll = async (req, res) => {
    try {
        const clients = await Client.findAll({
            include: { model: Order, as: 'orders' },
            order: [['updatedAt', 'DESC']]
        });
        res.status(200).json({ clients }).end();
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
};

const remove = [
    RouteProtector,
    param('id').exists().notEmpty().withMessage('Client ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const result = await Client.destroy({ where: { id } });

            if (result == 0) return res.status(404).json({ detail: '~Client not found~' }).end();

            res.status(204).end();
        } catch (e) {
            console.log(e);

            // Incorrect UUID ID string
            if (e.name == 'SequelizeDatabaseError' && e.parent && e.parent.routine == 'string_to_uuid') {
                return res.status(404).json({ detail: 'Client not found' }).end();
            }

            if (e.name == 'SequelizeForeignKeyConstraintError' && e.parent && e.parent.constraint) {
                if (e.parent.constraint == 'orders_clientId_fkey') {
                    return res.status(409).json({ detail: 'Deletion restricted. Order(s) reference(s)' }).end();
                }
            }

            res.status(400).end();
        }
    }
];

const get = [
    RouteProtector,
    param('id').exists().notEmpty().withMessage('Client ID required'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const client = await Client.findOne({ where: { id } });

            if (!client) return res.status(404).json({ detail: '~Client not found~' }).end();

            res.status(200).json({ client }).end();
        } catch (e) {
            console.log(e);
            // Incorrect UUID ID string
            if (e.name == 'SequelizeDatabaseError' && e.parent && e.parent.routine == 'string_to_uuid') {
                return res.status(404).json({ detail: 'Client not found' }).end();
            }

            res.status(400).end();
        }
    }
];

const update = [
    RouteProtector,
    param('id').exists().withMessage('Client ID required').isUUID().withMessage('Client ID should be of type string'),
    body('client').notEmpty().withMessage('Client object required'),
    body('client.name')
        .exists()
        .withMessage('Client name required')
        .isString()
        .withMessage('Client name should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty client name is not allowed')
        .isLength({ min: 3 })
        .withMessage('Client name must be at least 3 characters long'),
    body('client.email')
        .exists()
        .withMessage('Client email required')
        .isString()
        .withMessage('Client email should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty client email is not allowed')
        .isEmail()
        .withMessage('Client email is not correct'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const { client } = req.body;

            // Prepare data
            client.name = client.name.trim();
            client.email = client.email.trim();

            const [affectedRows, result] = await Client.update(client, { where: { id }, returning: true, limit: 1 });

            if (!affectedRows) return res.status(404).json({ detail: '~Client not found~' }).end();

            res.status(204).end();
        } catch (e) {
            console.log(e);

            // Incorrect UUID ID string
            if (e.name == 'SequelizeDatabaseError' && e.parent && e.parent.routine == 'string_to_uuid') {
                return res.status(404).json({ detail: 'Client not found' }).end();
            }

            if (e.name == 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ detail: 'Client with specified email already exists' }).end();
            }

            res.status(400).json(e).end();
        }
    }
];

module.exports = {
    getAll,
    remove,
    get,
    update
};
