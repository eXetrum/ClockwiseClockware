require('dotenv').config();
const { Pool } = require('pg');


const pool = new Pool({
	database: process.env.DEV_POSTGRES_DB,
	user: process.env.DEV_POSTGRES_USER,	
	password: process.env.DEV_POSTGRES_PASS,
	host: process.env.DEV_POSTGRES_HOST,
	port: process.env.DEV_POSTGRES_PORT,
	ssl: process.env.DEV_POSTGRES_SSL === 'true'
});

const execQuery = async (code, bind_args=null) => { 
	if(bind_args != null)
		return await pool.query(code, bind_args); 
	else
		return await pool.query(code);
};

module.exports = { execQuery, pool }