require('dotenv').config();
const jwt = require('jsonwebtoken');

const { ACCESS_SCOPE } = require('../constants');
const { User } = require('../database/models');

const RouteProtector = async (req, res, next, scope = ACCESS_SCOPE.AnyAuth) => {
    try {
        // Header exists
        if (!req.headers.authorization) return res.status(401).end();

        // Token exists and valid
        const token = req.headers.authorization.split(' ')[1];
        const tokenUser = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

        // Ensure user with id still exists
        const dbUser = await User.findOne({ where: { id: tokenUser.id } });
        if (!dbUser) return res.status(401).json({ detail: 'Account not found' }).end();

        // Ensure account is enabled (in case if administraotr decide to temporary disable)
        if (!dbUser.isEnabled) return res.status(401).json({ detail: 'Account temporary disabled' }).end();

        const details = await dbUser.getDetails();

        // Master/Client account must be with email verified flag (for master additionaly approved by admin).
        if (ACCESS_SCOPE.MasterOrClient.includes(dbUser.role) && !details.isEmailVerified) {
            return res.status(401).json({ detail: 'Email address is not confirmed yet' }).end();
        }

        if (ACCESS_SCOPE.MasterOnly.includes(dbUser.role) && !details.isApprovedByAdmin) {
            return res.status(401).json({ detail: 'Account is not approved by admin yet' }).end();
        }

        if (!scope.includes(dbUser.role)) return res.status(403).end();
    } catch (e) {
        console.log(e);
        return res.status(401).end();
    }

    next();
};

const RequireAuth =
    (scope = ACCESS_SCOPE.AnyAuth) =>
    async (req, res, next) =>
        RouteProtector(req, res, next, scope);

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.JWT_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRES });
};

module.exports = { RouteProtector: RequireAuth, RequireAuth, generateAccessToken };
