require('dotenv').config();
const { body, param, validationResult } = require('express-validator');
const moment = require('moment');
const db = require('../database/models/index');
const { User, Client, Master, Watches, City, Order, Confirmations } = require('../database/models');
const { RequireAuth, parseAuthToken } = require('../middleware/RouteProtector');
const { sendOrderConfirmationMail, sendEmailConfirmationMail } = require('../middleware/NodeMailer');
const {
    dateToNearestHour,
    generatePassword,
    generateConfirmationToken,
    isDbErrorEntryNotFound,
    formatDate,
    formatDecimal,
    createComparatorByProp
} = require('../utils');
const { ACCESS_SCOPE, USER_ROLES, MS_PER_HOUR, ORDER_STATUS, MIN_RATING_VALUE, MAX_RATING_VALUE } = require('../constants');

const cityNameComparator = createComparatorByProp('name');

const getAll = [
    RequireAuth(ACCESS_SCOPE.AnyAuth),
    async (req, res) => {
        try {
            const authUser = parseAuthToken(req.headers);

            let where = {};
            if (authUser.role === USER_ROLES.MASTER) where = { masterId: authUser.id };
            else if (authUser.role === USER_ROLES.CLIENT) where = { clientId: authUser.id };

            const records = await Order.findAll({
                where,
                include: [
                    { model: Client, include: [{ model: User }], attributes: { exclude: ['id', 'userId'] }, as: 'client' },
                    { model: Watches, as: 'watch' },
                    { model: City, as: 'city' },
                    { model: Master, include: [{ model: User }], attributes: { exclude: ['id', 'userId'] }, as: 'master' }
                ],
                attributes: { exclude: ['clientId', 'watchId', 'cityId', 'masterId'] },
                order: [['masterId'], ['startDate', 'DESC'], ['createdAt', 'DESC']]
            });

            const orders = records.map((order) => ({
                ...order.toJSON(),
                client: { ...order.client.toJSON(), ...order.client.User.toJSON() },
                master: { ...order.master.toJSON(), ...order.master.User.toJSON() }
            }));

            res.status(200).json({ orders }).end();
        } catch (error) {
            res.status(500).json(error).end();
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
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const authUser = parseAuthToken(req.headers);

            const { watchId, cityId, masterId, timezone, client } = req.body.order;
            let { startDate } = req.body.order;

            const watch = await Watches.findOne({ where: { id: watchId } });
            if (!watch) return res.status(409).json({ message: 'Unknown watch type' }).end();

            const city = await City.findOne({ where: { id: cityId } });
            if (!city) return res.status(409).json({ message: 'Unknown city' }).end();

            const master = await Master.findOne({
                where: { userId: masterId },
                include: [{ model: User }, { model: City, as: 'cities', through: { attributes: [] } }],
                attributes: { exclude: ['id', 'userId'] }
            });

            if (!master) return res.status(409).json({ message: 'Unknown master' }).end();
            if (!master.isEmailVerified) return res.status(409).json({ message: 'Master email is not verified' }).end();
            if (!master.isApprovedByAdmin) return res.status(409).json({ message: 'Master is not approved' }).end();

            // Ensure master can handle order for specified cityId
            if (master.cities.find((city) => city.id === cityId) == null) {
                return res.status(409).json({ message: 'Master cant handle this order at specified city' }).end();
            }

            // Prepare order params
            startDate = dateToNearestHour(startDate);
            client.name = client.name.trim();
            client.email = client.email.trim();
            const endDate = startDate + watch.repairTime * MS_PER_HOUR;
            const totalCost = city.pricePerHour * watch.repairTime;

            const clientDateTimeStart = moment.unix((startDate + timezone * MS_PER_HOUR) / 1000);
            const clientDateTimeEnd = moment.unix((startDate + timezone * MS_PER_HOUR + watch.repairTime * MS_PER_HOUR) / 1000);

            const dbUser = await User.findOne({ where: { email: client.email } });

            // User with role=Admin/Master cant create orders they should use different non Admin/Master accounts
            if (dbUser != null && dbUser.role !== USER_ROLES.CLIENT) {
                return res.status(409).json({ message: 'Clients only (new or existing)' }).end();
            }

            // User is not authenticated and user with specified email already exists
            // OR
            // user is authenticated but account id mismatch
            // If user currently authenticated
            // AND record for specified client email already exists in db
            // we should ensure that id for authenticated user eq user associated with email stored in db
            // otherwise deny order creation
            if ((authUser === null && dbUser != null) || (authUser !== null && dbUser != null && dbUser.id !== authUser.id)) {
                return res.status(403).json({ message: 'User already exists, please login to continue' }).end();
            }

            const [dbOrder, autoRegistration] = await db.sequelize.transaction(async (t) => {
                const autoRegistration = { email: client.email, password: '', verificationLink: '' };

                let clientId = null;
                if (dbUser == null) {
                    autoRegistration.password = generatePassword();
                    const user = await User.create(
                        { email: client.email, password: autoRegistration.password, role: USER_ROLES.CLIENT },
                        { transaction: t }
                    );
                    await user.createClient({ name: client.name }, { transaction: t });

                    const token = generateConfirmationToken();
                    await Confirmations.create({ userId: user.id, token }, { transaction: t });

                    autoRegistration.verificationLink = `${process.env.FRONTEND_ROOT_URL}/verify/${token}`;
                    clientId = user.id;
                } else {
                    await Client.update(
                        { name: client.name },
                        {
                            where: { userId: dbUser.id },
                            limit: 1
                        },
                        { transaction: t }
                    );
                    clientId = dbUser.id;
                }

                return [
                    await Order.create({ watchId, cityId, masterId, clientId, startDate, endDate, totalCost }, { transaction: t }),
                    autoRegistration
                ];
            });

            if (autoRegistration.password !== '') {
                // Auto registration -> send email confirmation message
                await sendEmailConfirmationMail({ ...autoRegistration });
            }

            // orderId, client, master, watch, city, startDate, endDate, totalCost
            await sendOrderConfirmationMail({
                orderId: dbOrder.id,
                client,
                master: { ...master.toJSON(), ...master.User.toJSON() },
                watch,
                city,
                startDate: formatDate(clientDateTimeStart).toString(),
                endDate: formatDate(clientDateTimeEnd).toString(),
                totalCost: formatDecimal(totalCost)
            });

            const order = await Order.findOne({
                where: { id: dbOrder.id },
                include: [
                    { model: Client, include: [{ model: User }], as: 'client' },
                    { model: Watches, as: 'watch' },
                    { model: City, as: 'city' },
                    {
                        model: Master,
                        as: 'master',
                        include: [{ model: User }, { model: Order, as: 'orders' }, { model: City, as: 'cities' }],
                        attributes: { exclude: ['id', 'userId'] }
                    }
                ],
                attributes: { exclude: ['clientId', 'watchId', 'cityId', 'masterId'] },
                order: [['masterId'], ['startDate', 'DESC'], ['createdAt', 'DESC']]
            });

            res.status(201)
                .json({
                    ...order.toJSON(),
                    client: { ...order.client.toJSON(), ...order.client.User.toJSON() },
                    master: { ...order.master.toJSON(), ...order.master.User.toJSON() },
                    ...(autoRegistration.password && { autoRegistration: true })
                })
                .end();
        } catch (error) {
            if (error.constraint === 'overlapping_times') {
                return res.status(409).json({ message: 'Master cant handle this order at specified datetime' }).end();
            }

            res.status(500).json(error).end();
        }
    }
];

const remove = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('Order ID required').isUUID().withMessage('Order ID should be of type string'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;

            const result = await Order.destroy({ where: { id } });
            if (result === 0) return res.status(404).json({ message: '~Order not found~' }).end();

            res.status(204).end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) {
                return res.status(404).json({ message: 'Order not found' }).end();
            }

            res.status(500).json(error).end();
        }
    }
];

const get = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('Order ID required').isUUID().withMessage('Order ID should be of type string'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;

            const order = await Order.findOne({
                where: { id },
                include: [
                    { model: Client, include: [{ model: User }], as: 'client' },
                    { model: Watches, as: 'watch' },
                    { model: City, as: 'city' },
                    {
                        model: Master,
                        as: 'master',
                        include: [{ model: User }, { model: Order, as: 'orders' }, { model: City, as: 'cities' }],
                        attributes: { exclude: ['id', 'userId'] }
                    }
                ],
                attributes: { exclude: ['clientId', 'watchId', 'cityId', 'masterId'] },
                order: [['masterId'], ['startDate', 'DESC'], ['createdAt', 'DESC']]
            });

            if (!order) return res.status(404).json({ message: '~Order not found~' }).end();

            res.status(200)
                .json({
                    order: {
                        ...order.toJSON(),
                        client: { ...order.client.toJSON(), ...order.client.User.toJSON() },
                        master: { ...order.master.toJSON(), ...order.master.User.toJSON() }
                    }
                })
                .end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) {
                return res.status(404).json({ message: 'Order not found' }).end();
            }

            res.status(500).json(error).end();
        }
    }
];

const update = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    param('id').exists().withMessage('Order ID required').isUUID().withMessage('Order ID should be of type string'),
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
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;
            const { watchId, cityId, masterId } = req.body.order;
            let { startDate } = req.body.order;

            const originalOrder = await Order.findOne({ where: { id } });
            if (!originalOrder) return res.status(404).json({ message: 'Order not found' }).end();

            // No updates allowed for completed/canceled orders
            if ([ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELED].includes(originalOrder.status)) {
                return res.status(409).json({ message: 'Restricted. Unable to update order details. Order is finallized now.' }).end();
            }

            const watch = await Watches.findOne({ where: { id: watchId } });
            if (!watch) return res.status(409).json({ message: 'Unknown watch type' }).end();

            const city = await City.findOne({ where: { id: cityId } });
            if (!city) return res.status(409).json({ message: 'Unknown city' }).end();

            const master = await Master.findOne({
                where: { userId: masterId },
                include: [{ model: User }, { model: City, as: 'cities', through: { attributes: [] } }],
                attributes: { exclude: ['id', 'userId'] }
            });

            if (!master) return res.status(409).json({ message: 'Unknown master' }).end();

            // Ensure master can handle order for specified cityId
            if (master.cities.find((city) => city.id === cityId) == null) {
                return res.status(409).json({ message: 'Master cant handle this order at specified city' }).end();
            }

            startDate = dateToNearestHour(startDate);
            const endDate = startDate + watch.repairTime * MS_PER_HOUR;
            const totalCost = city.pricePerHour * watch.repairTime;

            const [affectedRows, result] = await Order.update(
                { watchId, cityId, masterId, startDate, endDate, totalCost },
                { where: { id }, returning: true, limit: 1 }
            );
            if (!affectedRows) return res.status(404).json({ message: '~Order not found~' }).end();

            const newOrder = await Order.findOne({
                where: { id },
                include: [
                    { model: Client, include: [{ model: User }], as: 'client' },
                    { model: Watches, as: 'watch' },
                    { model: City, as: 'city' },
                    {
                        model: Master,
                        as: 'master',
                        include: [{ model: User }, { model: Order, as: 'orders' }, { model: City, as: 'cities' }],
                        attributes: { exclude: ['id', 'userId'] }
                    }
                ],
                attributes: { exclude: ['clientId', 'watchId', 'cityId', 'masterId'] },
                order: [['createdAt', 'DESC']]
            });

            res.status(200)
                .json({
                    order: {
                        ...newOrder.toJSON(),
                        client: { ...newOrder.client.toJSON(), ...newOrder.client.User.toJSON() },
                        master: { ...newOrder.master.toJSON(), ...newOrder.master.User.toJSON() }
                    }
                })
                .end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) return res.status(404).json({ message: 'Order not found' }).end();
            if (error.constraint === 'overlapping_times') {
                return res.status(409).json({ message: 'Master cant handle this order at specified datetime' }).end();
            }

            res.status(500).json(error).end();
        }
    }
];

const patch = [
    RequireAuth(ACCESS_SCOPE.AnyAuth),
    param('id').exists().withMessage('Order ID required').isUUID().withMessage('Order ID should be of type string'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { id } = req.params;
            const { status, rating } = req.body;

            const originalOrder = await Order.findOne({ where: { id } });
            if (!originalOrder) return res.status(404).json({ message: 'Order not found' }).end();

            const authUser = parseAuthToken(req.headers);
            // Admin and Master require 'status' value
            if (ACCESS_SCOPE.AdminOrMaster.includes(authUser.role)) {
                const { status } = req.body;
                if (status === undefined) return res.status(400).json({ message: 'Order status required' }).end();
                if (!Object.values(ORDER_STATUS).includes(status)) {
                    return res.status(400).json({ message: 'Incorrect order status value' }).end();
                }
            }

            // For clients there should be rating field
            if (authUser.role === USER_ROLES.CLIENT) {
                const { rating } = req.body;
                if (rating === undefined) return res.status(400).json({ message: 'Order rating required' }).end();
                const ratingFloatValue = parseFloat(rating);
                if (isNaN(ratingFloatValue) || ratingFloatValue < MIN_RATING_VALUE || ratingFloatValue > MAX_RATING_VALUE) {
                    return res
                        .status(400)
                        .json({
                            message: `Incorrect rating value (expected integer value in range[${MIN_RATING_VALUE}; ${MAX_RATING_VALUE}])`
                        })
                        .end();
                }
            }

            // ==== Client ==== (clients cant change status but can rate order)
            if (authUser.role === USER_ROLES.CLIENT) {
                if (originalOrder.rating !== null) {
                    return res.status(409).json({ message: 'Order already rated' }).end();
                }
                if (originalOrder.status === ORDER_STATUS.CONFIRMED) {
                    return res.status(409).json({ message: 'Order is not completed yet' }).end();
                }
                if (originalOrder.status === ORDER_STATUS.CANCELED) {
                    return res.status(409).json({ message: 'Order is marked as canceled and cannot be rated' }).end();
                }

                const [affectedRowsOrder, affectedRowsMaster] = await db.sequelize.transaction(async (t) => {
                    const [affectedRowsOrder, resultOrder] = await Order.update(
                        { rating },
                        { where: { id }, returning: true, limit: 1 },
                        { transaction: t }
                    );

                    const master = await Master.findOne({ where: { userId: originalOrder.masterId } }, { transaction: t });

                    // Recalc rating
                    const newRating = (master.rating * master.countOfReview + rating) / (master.countOfReview + 1);

                    const [affectedRowsMaster, resultMaster] = await Master.update(
                        { rating: newRating, countOfReview: master.countOfReview + 1 },
                        { where: { userId: originalOrder.masterId }, returning: true, limit: 1 },
                        { transaction: t }
                    );

                    return [affectedRowsOrder, affectedRowsMaster];
                });

                if (!affectedRowsOrder || !affectedRowsMaster) return res.status(404).json({ message: '~Order not found~' }).end();

                return res.status(204).end();
            }

            // ==== Admin/Master ====
            // No updates allowed for completed/canceled orders
            if ([ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELED].includes(originalOrder.status)) {
                return res.status(409).json({ message: 'Restricted. Unable to update order details. Order is finallized now.' }).end();
            }

            // === Master === (only can mark order as completed)
            if (authUser.role === USER_ROLES.MASTER) {
                if (status !== ORDER_STATUS.COMPLETED) {
                    return res.status(409).json({ message: 'Restricted. Specified order status is not allowable for master role' }).end();
                }
            }

            // New order status should be either canceled/completed
            // Order already completed
            if (originalOrder.status === ORDER_STATUS.COMPLETED) {
                return res.status(409).json({ message: 'Order already completed' }).end();
            }
            // Order canceled
            if (originalOrder.status === ORDER_STATUS.CANCELED) {
                return res.status(409).json({ message: 'Order canceled and cannot be marked as completed' }).end();
            }

            // Update status
            const [affectedRows, result] = await Order.update({ status }, { where: { id }, returning: true, limit: 1 });
            if (!affectedRows) return res.status(404).json({ message: '~Order not found~' }).end();
            return res.status(204).end();
        } catch (error) {
            if (isDbErrorEntryNotFound(error)) return res.status(404).json({ message: 'Order not found' }).end();
            res.status(500).json(error).end();
        }
    }
];

module.exports = {
    getAll,
    create,
    remove,
    get,
    update,
    patch
};
