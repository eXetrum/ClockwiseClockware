require('dotenv').config();

module.exports = {
	development: {
		username: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASS,
		database: process.env.POSTGRES_DB,
		host: process.env.POSTGRES_HOST,
		port: process.env.POSTGRES_PORT,
		ssl: process.env.POSTGRES_SSL === 'true',
		dialect: 'postgres'
	},
	test: {
		username: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASS,
		database: process.env.POSTGRES_DB,
		host: process.env.POSTGRES_HOST,
		port: process.env.POSTGRES_PORT,
		ssl: process.env.POSTGRES_SSL === 'true',
		dialect: 'postgres'
	},
	production: {
		username: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASS,
		database: process.env.POSTGRES_DB,
		host: process.env.POSTGRES_HOST,
		port: process.env.POSTGRES_PORT,
		ssl: process.env.POSTGRES_SSL === 'true',
		dialect: 'postgres'
	}
};