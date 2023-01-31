require('dotenv').config();
const { Pool } = require('pg');
//const cfg = require('./config/db.config');

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

/////////////////////////////////////////////////////////////////////// 
const getUser = async (email, password) => {
	if(!email || !password) return null;
	let result = await execQuery('SELECT * FROM admins WHERE email=$1 AND password=$2 LIMIT 1', [email, password]);
	if(result.rows == []) return null;
	return result.rows[0];
};

/////////////////////////////////////////////////////////////////////// Items
const getItems = async () => {
	let result = await execQuery('SELECT * FROM items');
	return result.rows;
};

/////////////////////////////////////////////////////////////////////// Cities
const getCities = async () => {
	let result = await execQuery('SELECT * FROM cities');
	return result.rows;
};

module.exports = { pool, execQuery, getUser, getItems, getCities };

  