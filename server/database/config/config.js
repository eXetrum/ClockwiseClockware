require('dotenv').config();

module.exports = {
	development: {
		username: process.env.DEV_POSTGRES_USER,
		password: process.env.DEV_POSTGRES_PASS,
		database: process.env.DEV_POSTGRES_DB,
		host: process.env.DEV_POSTGRES_HOST,
		port: process.env.DEV_POSTGRES_PORT,
		ssl: process.env.DEV_POSTGRES_SSL === 'true',
		dialect: 'postgres'
	},
	test: {
		username: process.env.TEST_POSTGRES_USER,
		password: process.env.TEST_POSTGRES_PASS,
		database: process.env.TEST_POSTGRES_DB,
		host: process.env.TEST_POSTGRES_HOST,
		port: process.env.TEST_POSTGRES_PORT,
		ssl: process.env.TEST_POSTGRES_SSL === 'true',
		dialect: 'postgres'
	},
	production: {
		username: process.env.PROD_POSTGRES_USER,
		password: process.env.PROD_POSTGRES_PASS,
		database: process.env.PROD_POSTGRES_DB,
		host: process.env.PROD_POSTGRES_HOST,
		port: process.env.PROD_POSTGRES_PORT,
		ssl: process.env.PROD_POSTGRES_SSL === 'true',
		dialect: 'postgres'
	}
};