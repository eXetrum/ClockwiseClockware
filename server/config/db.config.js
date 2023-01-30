require('dotenv/config');

const DB_NAME = 'clockwiseclockware';
const USERNAME = 'postgres';
const PASSWORD = 'postgres';
const HOST = '127.0.0.1';
const PORT = '5433';

module.exports = {
	DB_NAME: DB_NAME,
	USERNAME: USERNAME,
	PASSWORD: PASSWORD,
	HOST: HOST,
	PORT: PORT,
	CONNECTION_STRING: `pg://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/postgres`
};