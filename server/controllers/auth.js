const { RequireAuth } = require('../middleware/RouteProtector');
const { USER_ROLES, ACCESS_SCOPE } = require('../constants');
const { generateAccessToken } = require('../middleware/RouteProtector');
const { body, validationResult } = require('express-validator');
const db = require('../database/models/index');
const { User, City, Confirmations } = require('../database/models');
const { sendPasswordResetMail, sendEmailConfirmationMail } = require('../middleware/NodeMailer');
const { generatePassword, generateConfirmationToken } = require('../utils');
const { isDbErrorEntryAlreadyExists } = require('../utils');

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
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { email, password, name, role } = req.body;

            const user = await db.sequelize.transaction(async (t) => {
                if (role === USER_ROLES.CLIENT) {
                    const user = await User.create({ email: email.trim(), password: password.trim(), role }, { transaction: t });
                    await user.createClient({ name: name.trim() }, { transaction: t });
                    return user;
                } else if (role === USER_ROLES.MASTER) {
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

                    if (masterCities.length === 0) {
                        return res.status(409).json({ message: 'master must be associated at least with one city' }).end();
                    }

                    const user = await User.create({ email, password, role }, { transaction: t });
                    const details = await user.createMaster({ name, rating: 5 }, { transaction: t });
                    await details.setCities(masterCities, { transaction: t });

                    return user;
                } else if (role === USER_ROLES.ADMIN) {
                    const user = await User.create({ email, password, role }, { transaction: t });
                    await user.createAdmin({}, { transaction: t });

                    return user;
                }
            });

            // Send confirmation message to user email
            const token = generateConfirmationToken();
            const verificationLink = `${process.env.FRONTEND_ROOT_URL}/verify/${token}`;

            await Confirmations.create({ userId: user.id, token });

            const result = await sendEmailConfirmationMail({ email, password, verificationLink });
            if (!('messageId' in result)) {
                return res
                    .status(500)
                    .json({ message: result ? result.toString() : 'NodeMailer error' })
                    .end();
            }

            return res.status(204).end();
        } catch (error) {
            if (isDbErrorEntryAlreadyExists(error)) return res.status(409).json({ message: 'User email already exists' }).end();
            res.status(400).json(error).end();
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
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { email, password } = req.body;
            const user = await User.scope('withPassword').findOne({ where: { email } });

            if (!user || !user.authenticate(password)) {
                return res.status(401).json({ message: 'Incorrect user/password pair' }).end();
            }

            if (!user.isEnabled) return res.status(403).json({ message: 'Account temporary disabled' }).end();

            const details = await user.getDetails();

            if (ACCESS_SCOPE.MasterOrClient.includes(user.role) && !details.isEmailVerified) {
                return res.status(403).json({ message: 'Email address is not confirmed yet' }).end();
            }

            if (ACCESS_SCOPE.MasterOnly.includes(user.role) && !details.isApprovedByAdmin) {
                return res.status(403).json({ message: 'Account is not approved yet' }).end();
            }

            const token = generateAccessToken({ ...details.toJSON(), ...user.toJSON() });

            res.status(200).json({ accessToken: token }).end();
        } catch (error) {
            res.status(400).json(error).end();
        }
    }
];

const verify = async (req, res) => {
    try {
        const { token } = req.params;

        const confirmation = await Confirmations.findOne({ where: { token } });
        if (!confirmation) return res.status(400).json({ message: 'Invalid token' }).end();

        const user = await User.findOne({ where: { id: confirmation.userId } });
        if (!user) return res.status(400).json({ message: 'User not found' }).end();

        const account = await user.getDetails();
        if (account.isEmailVerified === true) {
            return res.status(409).json({ message: 'User has been already verified' }).end();
        }

        await account.setEmailVerified(true);
        await account.save();

        await Confirmations.destroy({ where: { token } });

        res.status(200).json({ message: 'Your account has been successfully verified' }).end();
    } catch (error) {
        res.status(400).json(error).end();
    }
};

const resetPassword = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    body('userId').exists().withMessage('userId required').isString().withMessage('userId should be of string type'),
    async (req, res) => {
        try {
            const errors = validationResult(req).array();
            if (errors && errors.length) return res.status(400).json({ message: errors[0].msg }).end();

            const { userId } = req.body;

            const user = await User.findOne({ where: { id: userId } });
            if (!user) return res.status(404).json({ message: 'User not found' }).end();

            if (!ACCESS_SCOPE.MasterOrClient.includes(user.role)) {
                return res.status(409).json({ message: 'Unable to reset password for this user type' }).end();
            }

            const password = generatePassword();
            await user.setPassword(password);
            await user.save();

            const result = await sendPasswordResetMail({ email: user.email, password });
            if (!('messageId' in result)) {
                return res
                    .status(500)
                    .json({ message: result ? result.toString() : 'NodeMailer error' })
                    .end();
            }

            return res.status(204).end();
        } catch (error) {
            res.status(400).json(error).end();
        }
    }
];

const resendEmailConfirmation = [
    RequireAuth(ACCESS_SCOPE.AdminOnly),
    body('userId').exists().withMessage('userId required').isString().withMessage('userId should be of string type'),
    async (req, res) => {
        try {
            console.log('resendEmailConfirmation');
            const { userId } = req.body;
            const user = await User.findOne({ where: { id: userId } });
            if (!user) return res.status(404).json({ message: 'User not found' }).end();

            if (!ACCESS_SCOPE.MasterOrClient.includes(user.role)) {
                return res.status(409).json({ message: 'Unable to resend email confirmation letter for this user type' }).end();
            }

            const account = await user.getDetails();
            if (account.isEmailVerified === true) {
                return res.status(409).json({ message: 'User has been already verified. Please Login' }).end();
            }

            const token = generateConfirmationToken();
            const verificationLink = `${process.env.FRONTEND_ROOT_URL}/verify/${token}`;

            await Confirmations.destroy({ where: { userId: user.id } });
            await Confirmations.create({ userId: user.id, token });

            const result = await sendEmailConfirmationMail({ email: user.email, password: null, verificationLink });
            if (!('messageId' in result)) {
                return res
                    .status(500)
                    .json({ message: result ? result.toString() : 'NodeMailer error' })
                    .end();
            }

            return res.status(204).end();
        } catch (error) {
            res.status(400).json(error).end();
        }
    }
];

module.exports = {
    create,
    login,
    verify,
    resetPassword,
    resendEmailConfirmation
};
