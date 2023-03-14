const { generateAccessToken } = require('../middleware/RouteProtector');
const { body, validationResult } = require('express-validator');
const db = require('../database/models/index');
const { User, Admin, Client, Master, City } = require('../database/models');

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
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ detail: errors[0].msg }).end();
            // TODO:
            let { email, password, name, role } = req.body;
            email = email.trim();
            password = password.trim();
            name = name.trim();
            role = role.trim();

            console.log('register=', email, password, role, name);

            const [user, details] = await db.sequelize.transaction(async (t) => {
                if (role === 'client') {
                    const user = await User.create({ email, password, role }, { transaction: t });
                    const details = await user.createClient({ name }, { transaction: t });

                    delete user.password;
                    delete details.id;
                    delete details.userId;

                    return [{ ...user.toJSON(), name }, details];
                } else if (role === 'master') {
                    let { cities } = req.body;

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

                    const user = await User.create({ email, password, role }, { transaction: t });
                    const details = await user.createMaster({ name, rating: 5 }, { transaction: t });
                    await details.setCities(masterCities, { transaction: t });

                    delete user.password;
                    delete details.id;
                    delete details.userId;

                    return [{ ...details.toJSON(), ...user.toJSON() }, details];
                } else if (role === 'admin') {
                    const user = await User.create({ email, password, role }, { transaction: t });
                    const details = await user.createAdmin({}, { transaction: t });

                    delete user.password;
                    delete details.id;
                    delete details.userId;

                    return [{ ...details.toJSON(), ...user.toJSON() }, details];
                }
            });

            if (user.role === 'master') user.cities = await details.getCities();

            res.status(201).json({ user });
        } catch (e) {
            console.log(e);

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
            const user = await User.scope('withPassword').findOne({ where: { email } });

            if (!user || !user.authenticate(password)) {
                return res.status(401).json({ detail: 'Incorrect user/password pair' }).end();
            }

            const details = user.getDetails();

            delete user.password;
            delete details.id;
            delete details.userId;

            const token = generateAccessToken({ ...user.toJSON(), ...details.toJSON() });

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
