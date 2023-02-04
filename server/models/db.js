require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
	database: process.env.POSTGRES_DB,
	user: process.env.POSTGRES_USER,	
	password: process.env.POSTGRES_PASS,
	host: process.env.POSTGRES_HOST,
	port: process.env.POSTGRES_PORT	
});

const execQuery = async (code, bind_args=null) => { 
	if(bind_args != null)
		return await pool.query(code, bind_args); 
	else
		return await pool.query(code);
};

module.exports = { execQuery, pool }