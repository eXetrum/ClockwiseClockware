const { Pool } = require('pg');
const cfg = require('./config/db.config');

const pool = new Pool({
	user: cfg.USERNAME,
	database: cfg.DB_NAME,
	password: cfg.PASSWORD,
	port: cfg.PORT,
	host: cfg.HOST,
});

const execQuery = async (code, bind_args=null) => { 
	if(bind_args != null)
		return await pool.query(code, bind_args); 
	else
		return await pool.query(code);
};

/////////////////////////////////////////////////////////////////////// Admins
const getUser = async (email, password) => {
	if(!email || !password) return null;
	let result = await execQuery('SELECT * FROM admins WHERE email=$1 AND password=$2 LIMIT 1', [email, password]);
	if(result.rows == []) return null;
	return result.rows[0];
};

/////////////////////////////////////////////////////////////////////// Masters
const getAllMasters = async () => {
	let result = await execQuery('SELECT * FROM masters');
	return result.rows;
};

const getMasterById = async (id) => {
	if(id === undefined || id === null) return null;
	let result = await execQuery('SELECT * FROM masters WHERE id=$1 LIMIT 1', [id]);
	if(result.rows == []) return null;
	return result.rows[0];
};

/*const updateMasterById = async (id) => {
	if(id === undefined || id === null) return null;
	let result = await execQuery('SELECT * FROM masters WHERE id=$1 LIMIT 1', [id]);
	if(result.rows == []) return null;
	return result.rows[0];
};*/

module.exports = { pool, execQuery, getUser };

  