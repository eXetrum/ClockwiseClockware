require('dotenv').config();
const jwt = require('jsonwebtoken');

const { ACCESS_SCOPE } = require('../constants');

const RouteProtector = async (req, res, next, scope = ACCESS_SCOPE.AnyAuth) => {
    if (!req.headers.authorization) {
        res.status(401).end();
        return;
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        const user = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

        if (!scope.includes(user.role)) res.status(403).end();
    } catch (e) {
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
