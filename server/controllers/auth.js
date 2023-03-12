const { generateAccessToken } = require('../middleware/RouteProtector');
const { body, validationResult } = require('express-validator');
const db = require('../database/models/index');
const { User, Admin, Client, Master } = require('../database/models');

const { USER_ROLES } = require('../constants');

const REGISTRABLE_ENTITIES = [...Object.values(USER_ROLES)].filter((item) => item !== 'admin');

const create = [
    body('email')
        .exists()
        .withMessage('User email required')
        .isString()
        .withMessage('User email should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty user email is not allowed')
        .isEmail()
        .withMessage('User email is not correct'),
    body('password')
        .exists()
        .withMessage('User password required')
        .isString()
        .withMessage('User password should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty user password is not allowed'),
    body('role').exists().withMessage('User role required').isIn(REGISTRABLE_ENTITIES).withMessage('Incorrect value for role field'),
    body('name').exists().withMessage('User name required').trim().escape().notEmpty().withMessage('Empty user name is not allowed'),
    body('role')
        .if((value, { req }) => value === 'master')
        .custom((value, { req }) => {
            const { cities } = req.body;
            if (cities === undefined) throw new Error('For master role, cities required');
            if (!Array.isArray(cities)) throw new Error('cities must be of array type');
            cities.forEach((city) => {
                if (!('id' in city)) throw new Error('Each object of cities array should contains id field');
            });
            return true;
        }),

    async (req, res) => {
        let transaction = null;
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();
            // TODO:
            const { email, password, name, role } = req.body;
            console.log('register=', email, password, role);

            transaction = await db.sequelize.transaction();

            if (role === 'client') {
                const user = await User.create({ email, password, role });
                console.log('user: ', user);
                const result = await user.createClient({ name });
                console.log('result: ', result);
            } else if (role === 'master') {
                const { cities } = req.body;
                //const client = await Client.create({ name });
                //const master = await Master.create({});
                //user.setUserRefId(client.id);
                throw new Error('bruh');
            }
            await transaction.commit();
            res.status(200).json({ email, password, role });
        } catch (e) {
            console.log(e);
            if (transaction) transaction.rollback();

            if (e.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ detail: 'User email already exists' }).end();
            res.status(400).end();
        }
    }
];

const login = [
    body('email')
        .exists()
        .withMessage('User email required')
        .isString()
        .withMessage('User email should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty user email is not allowed')
        .isEmail()
        .withMessage('User email is not correct'),
    body('password')
        .exists()
        .withMessage('User password required')
        .isString()
        .withMessage('User password should be of type string')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Empty user password is not allowed'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();

            // Get user input
            const { email, password } = req.body;
            let user = await User.findOne({ where: { email } });
            //const user = await Admin.findOne({ where: { email } });
            console.log('user=', user);
            const a = await user.getAdmin();
            console.log('user A=', a);
            const b = await user.getClient();
            console.log('user B=', b);
            const c = await user.getMaster();
            console.log('user C=', c);

            if (!user) {
                return res.status(401).json({ detail: 'Incorrect user/password pair' }).end();
            }

            if (!user.authenticate(password)) {
                return res.status(401).json({ detail: 'Incorrect user/password pair' }).end();
            }

            let params = null;
            if (user.role === 'admin') params = await user.getAdmin();
            else if (user.role === 'master') params = await user.getMaster();
            else if (user.role === 'client') params = await user.getClient();

            user = { ...user.toJSON(), ...params.toJSON() };

            const token = generateAccessToken(user); //.toJSON());
            res.status(200).json({ accessToken: token }).end();
        } catch (e) {
            res.status(400).end();
        }
    }
];

module.exports = {
    create,
    login
};
