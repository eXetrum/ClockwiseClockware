const { RequireAuth } = require('../middleware/RouteProtector');
const { ACCESS_SCOPE } = require('../constants');
const { body, param, query, validationResult } = require('express-validator');
const { sendOrderConfirmationMail } = require('../middleware/NodeMailer');
const moment = require('moment');
const { Op } = require('sequelize');
const db = require('../database/models/index');
const { Order, Client, Watches, City, Master } = require('../database/models');

const MS_PER_HOUR = 60 * 60 * 1000;

const dateToNearestHour = (timestamp) => Math.ceil(timestamp / MS_PER_HOUR) * MS_PER_HOUR;

const getFreeMasters = [
    query('cityId').exists().withMessage('cityId required').isUUID().withMessage('cityId should be of type string'),
    query('watchId').exists().withMessage('watchId required').isUUID().withMessage('watchId should be of type string'),
    query('startDate')
        .exists()
        .withMessage('startDate required')
        .isInt({ min: 0 })
        .toInt()
        .withMessage('startDate should be of type int')
        .custom((value, { req }) => {
            const curDate = Date.now();
            if (new Date(value).toString() === 'Invalid Date') throw new Error('Invalid timestamp');
            if (value < curDate) throw new Error('Past date time is not allowed');
            return true;
        }),

    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            let { cityId, watchId, startDate } = req.query;

            const city = await City.findOne({ where: { id: cityId } });
            if (!city) return res.status(400).json({ detail: 'Unknown city' }).end();

            const watch = await Watches.findOne({ where: { id: watchId } });
            if (!watch) return res.status(400).json({ detail: 'Unknown watch type' }).end();

            /// ///////////////////////////////////////////////////
            startDate = dateToNearestHour(startDate);
            const orderRepairTime = watch.repairTime;
            const orderStartDate = startDate;
            const orderEndDate = startDate + orderRepairTime * MS_PER_HOUR;

            let bussyMasters = await Order.findAll({
                raw: true,
                attributes: ['masterId'],
                group: ['masterId'],
                where: {
                    startDate: { [Op.lt]: orderEndDate },
                    endDate: { [Op.gt]: orderStartDate }
                }
            });
            bussyMasters = bussyMasters.map((item) => item.masterId);

            let masters = await Master.findAll({
                where: {
                    id: { [Op.notIn]: bussyMasters }
                },
                include: [
                    { model: City, as: 'cities', through: { attributes: [] } },
                    {
                        model: Order,
                        as: 'orders',
                        include: [
                            { model: Watches, as: 'watch' },
                            { model: City, as: 'city' }
                        ],
                        attributes: { exclude: ['clientId', 'watchId', 'cityId', 'masterId'] },
                        order: [['updatedAt', 'DESC']]
                    }
                ],
                order: [
                    ['rating', 'DESC'],
                    ['updatedAt', 'DESC']
                ]
            });

            // No idea how to filter these on 'sequelize level' ([city])
            masters = masters.filter((master) => master.cities.find((city) => city.id === cityId));

            res.status(200).json({ masters }).end();
        } catch (e) {
            res.status(400).end();
        }
    }
];

const create = [
    body('order').exists().withMessage('order object required').isObject().withMessage('order object required'),
    body('order.client').exists().withMessage('order.client object required').isObject().withMessage('order.client object required'),
    body('order.client.name')
        .exists()
        .withMessage('order.client.name required')
        .isString()
        .withMessage('Client name should be of type string')
        .trim()
        .escape()
        .isLength({ min: 3 })
        .withMessage('Empty client name is not allowed (min len=3)'),
    body('order.client.email')
        .exists()
        .withMessage('order.client.email required')
        .isString()
        .withMessage('Client email should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty client email is not allowed')
        .isEmail()
        .withMessage('Client email is not correct'),
    body('order.watchId').exists().withMessage('order.watchId required').isUUID().withMessage('watchId should be of type string'),
    body('order.cityId').exists().withMessage('order.cityId required').isUUID().withMessage('cityId should be of type string'),
    body('order.masterId').exists().withMessage('order.masterId required').isUUID().withMessage('masterId should be of type string'),
    body('order.startDate')
        .exists()
        .withMessage('order.startDate required')
        .isInt({ min: 0 })
        .toInt()
        .withMessage('order.startDate should be of type int')
        .custom((value, { req }) => {
            const curDate = Date.now();
            if (new Date(value).toString() === 'Invalid Date') throw new Error('Invalid timestamp');
            if (value < curDate) throw new Error('Past date time is not allowed');
            return true;
        }),
    body('order.timezone')
        .exists()
        .withMessage('order.timezone required')
        .isInt()
        .toInt()
        .withMessage('order.timezone should be of type int'),

    async (req, res) => {
        let transaction = null;
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { order } = req.body;

            const watch = await Watches.findOne({ where: { id: order.watchId } });
            if (!watch) return res.status(409).json({ detail: 'Unknown watch type' });

            const city = await City.findOne({ where: { id: order.cityId } });
            if (!city) return res.status(409).json({ detail: 'Unknown city' });

            const master = await Master.findOne({
                where: { id: order.masterId },
                include: [{ model: City, as: 'cities', through: { attributes: [] } }]
            });
            if (!master) return res.status(409).json({ detail: 'Unknown master' });

            // Ensure master can handle order for specified cityId
            if (master.cities.find((city) => city.id === order.cityId) == null) {
                return res.status(409).json({ detail: 'Master cant handle this order at specified city' });
            }
            /// ///////////////////////////////////////////////////
            order.startDate = dateToNearestHour(order.startDate);
            order.client.name = order.client.name.trim();
            order.client.email = order.client.email.trim();
            order.endDate = order.startDate + watch.repairTime * MS_PER_HOUR;
            order.totalCost = city.pricePerHour * watch.repairTime;

            const clientDateTimeStart = moment.unix((order.startDate + order.timezone * MS_PER_HOUR) / 1000);
            const clientDateTimeEnd = moment.unix((order.startDate + order.timezone * MS_PER_HOUR + watch.repairTime * MS_PER_HOUR) / 1000);

            transaction = await db.sequelize.transaction();
            let client = await Client.findOne({ where: { email: order.client.email } });
            if (client == null) {
                client = await Client.create(order.client, { transaction });
            } else {
                await Client.update({ name: order.client.name }, { where: { email: order.client.email } }, { transaction });
            }
            order.clientId = client.id;
            const result = await Order.create(order, { transaction });
            await transaction.commit();

            // orderId, client, master, watch, city, startDate, endDate, totalCost
            const confirmation = await sendOrderConfirmationMail({
                orderId: result.id,
                client: order.client,
                master,
                watch,
                city,
                startDate: clientDateTimeStart.toString(),
                endDate: clientDateTimeEnd.toString(),
                totalCost: order.totalCost
            });

            res.status(201).json({ confirmation }).end();
        } catch (e) {
            if (transaction) await transaction.rollback();

            if (e.constraint === 'overlapping_times') {
                return res.status(409).json({ detail: 'Master cant handle this order at specified datetime' });
            }

            res.status(400).end();
        }
    }
];

const getAll = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    async (req, res) => {
        try {
            const orders = await Order.findAll({
                include: [
                    { model: Client, as: 'client' },
                    { model: Watches, as: 'watch' },
                    { model: City, as: 'city' },
                    { model: Master, as: 'master' }
                ],
                attributes: { exclude: ['clientId', 'watchId', 'cityId', 'masterId'] },
                order: [['masterId'], ['startDate', 'DESC'], ['updatedAt', 'DESC']]
            });
            res.status(200).json({ orders }).end();
        } catch (e) {
            res.status(400).json(e).end();
        }
    }
];

const remove = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('Order ID required').isUUID().withMessage('Order ID should be of type string'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;

            const result = await Order.destroy({ where: { id } });
            if (result === 0) return res.status(404).json({ detail: '~Order not found~' }).end();

            res.status(204).end();
        } catch (e) {
            // Incorrect UUID ID string
            if (e.name === 'SequelizeDatabaseError' && e.parent && e.parent.routine === 'string_to_uuid') {
                return res.status(404).json({ detail: 'Order not found' }).end();
            }

            res.status(400).json(e).end();
        }
    }
];

const get = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('Order ID required').isString().withMessage('Order ID should be of type string'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;

            const order = await Order.findOne({
                where: { id },
                include: [
                    { model: Client, as: 'client' },
                    { model: Watches, as: 'watch' },
                    { model: City, as: 'city' },
                    {
                        model: Master,
                        as: 'master',
                        include: [
                            { model: Order, as: 'orders' },
                            { model: City, as: 'cities' }
                        ]
                    }
                ]
            });

            if (!order) return res.status(404).json({ detail: '~Order not found~' }).end();

            const curDate = Date.now();
            if (new Date(order.startDate).getTime() < curDate) {
                return res.status(403).json({ detail: 'Unable to get order with datetime that is already past' }).end();
            }

            res.status(200).json({ order }).end();
        } catch (e) {
            // Incorrect UUID ID string
            if (e.name === 'SequelizeDatabaseError' && e.parent && e.parent.routine === 'string_to_uuid') {
                return res.status(404).json({ detail: 'Order not found' }).end();
            }

            res.status(400).end();
        }
    }
];

const update = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('Order ID required').isString().withMessage('Order ID should be of type string'),
    body('order').exists().withMessage('order object required').isObject().withMessage('order object required'),
    body('order.watchId').exists().withMessage('order.watchId required').isUUID().withMessage('Incorrect watchId'),
    body('order.cityId').exists().withMessage('order.cityId required').isUUID().withMessage('Incorrect cityId'),
    body('order.masterId').exists().withMessage('order.masterId required').isUUID().withMessage('Incorrect masterId'),
    body('order.startDate')
        .exists()
        .withMessage('order.startDate required')
        .isInt({ min: 0 })
        .toInt()
        .withMessage('order.startDate should be of type int')
        .custom((value, { req }) => {
            const curDate = Date.now();
            if (new Date(value).toString() === 'Invalid Date') throw new Error('Invalid timestamp');
            if (value < curDate) throw new Error('Past date time is not allowed');
            return true;
        }),
    body('order.status')
        .exists()
        .withMessage('order.status required')
        .isIn(['confirmed', 'completed', 'canceled'])
        .withMessage('Incorrect order status'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            const { id } = req.params;
            const { order } = req.body;

            const watch = await Watches.findOne({ where: { id: order.watchId } });
            if (!watch) return res.status(409).json({ detail: 'Unknown watch type' });

            const city = await City.findOne({ where: { id: order.cityId } });
            if (!city) return res.status(409).json({ detail: 'Unknown city' });

            const master = await Master.findOne({
                where: { id: order.masterId },
                include: [{ model: City, as: 'cities', through: { attributes: [] } }]
            });
            if (!master) return res.status(409).json({ detail: 'Unknown master' });

            // Ensure master can handle order for specified cityId
            if (master.cities.find((city) => city.id === order.cityId) == null) {
                return res.status(409).json({ detail: 'Master cant handle this order at specified city' });
            }
            /// ///////////////////////////////////////////////////

            order.startDate = dateToNearestHour(order.startDate);
            order.endDate = order.startDate + watch.repairTime * MS_PER_HOUR;
            order.totalCost = city.pricePerHour * watch.repairTime;

            const [affectedRows, result] = await Order.update(order, { where: { id }, returning: true, limit: 1 });
            if (!affectedRows) return res.status(404).json({ detail: '~Order not found~' }).end();

            res.status(204).end();
        } catch (e) {
            if (e.constraint === 'overlapping_times') {
                return res.status(409).json({ detail: 'Master cant handle this order at specified datetime' });
            }

            res.status(400).end();
        }
    }
];

module.exports = {
    getFreeMasters,
    create,
    getAll,
    remove,
    get,
    update
};
