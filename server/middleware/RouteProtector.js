require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hashPassword = async plaintextPassword => {
    const hash = await bcrypt.hash(plaintextPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    return hash;
};
const comparePassword = async (plaintextPassword, hash) => {
    const result = await bcrypt.compare(plaintextPassword, hash);
    return result;
};

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

const generateAccessToken = user => {
    return jwt.sign(user, process.env.JWT_TOKEN_SECRET, { expiresIn: process.env.JWT_TOKEN_EXPIRES });
};

module.exports = { RouteProtector, generateAccessToken, comparePassword, hashPassword };
