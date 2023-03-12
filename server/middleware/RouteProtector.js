require('dotenv').config();
const jwt = require('jsonwebtoken');

const RouteProtector = async (req, res, next) => {
    if (!req.headers.authorization) {
        res.status(401).end();
        return;
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    } catch (e) {
        res.status(401).end();
        return;
    }

    next();
};

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.JWT_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRES });
};

module.exports = { RouteProtector, generateAccessToken };
