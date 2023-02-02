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
const getWatchTypes = async () => {
	let result = await execQuery('SELECT * FROM watch_type');
	return result.rows;
};

/////////////////////////////////////////////////////////////////////// Cities
const getCities = async () => {
	let result = await execQuery('SELECT * FROM cities');
	return result.rows;
};

const createCity = async (cityName) => {
	console.log('createCity: ', cityName);
	await execQuery('INSERT INTO cities (name) VALUES ($1);', [cityName]);
	let result = await execQuery('SELECT * FROM cities');
	console.log('createCity: ', result.rows);
	return result.rows;
};

const deleteCityById = async (id) => {
	console.log('deleteCityById: ', id);
	let result = await execQuery('DELETE FROM cities WHERE id=($1);', [id]);
	return result.rows;
};

const getCityById = async (id) => {
	console.log('getCityById: ', id);
	let result = await execQuery('SELECT * FROM cities WHERE id=($1);', [id]);
	return result.rows;
};

const updateCityById = async (id, cityName) => {
	console.log('updateCityById: ', id, cityName);
	let result = await execQuery('UPDATE cities SET name=$1 WHERE id=($2);', [cityName, id]);
	return result.rows;
};

/////////////////////////////////////////////////////////////////////// Masters
const getMasters = async () => {
	let result = await execQuery(
	`SELECT id, name, email, rating, (
			SELECT json_agg(C.*) 
			FROM 
				cities C 
				INNER JOIN master_city_list MCL 
				ON C.id = MCL.city_id AND MCL.master_id = M.id
			) AS cities 
	FROM masters M;`);
	return result.rows;
};

const createMaster = async (master) => {
	console.log('createMaster before query: ', master);
	const res = await execQuery(
		`WITH new_master AS(
			INSERT INTO masters (name, email, rating)
			VALUES ($1, $2, $3)
			RETURNING id
		)
		INSERT INTO master_city_list (master_id, city_id)
		VALUES(
			(SELECT id FROM new_master),
			unnest($4::integer[])
		);
	`, [master.name, master.email, master.rating, master.cities]);
	let result = await execQuery(
	`SELECT id, name, email, rating, (
			SELECT json_agg(C.*) 
			FROM 
				cities C 
				INNER JOIN master_city_list MCL 
				ON C.id = MCL.city_id AND MCL.master_id = M.id
			) AS cities 
	FROM masters M;`);
	console.log('createMaster result: ', result.rows);
	return result.rows;
};

const deleteMasterById = async (id) => {
	console.log('deleteMasterById: ', id);
	let result = await execQuery(
		`DELETE
		FROM
			masters AS ma
		USING
			master_city_list AS mcl
		WHERE
			ma.id=mcl.master_id
		AND ma.id=($1);`, [id]);
	return result.rows;
};

const getMasterById = async (id) => {
	console.log('getMasterById: ', id);
	let result = await execQuery(
		`SELECT id, name, email, rating, (
			SELECT json_agg(C.*) 
			FROM 
				cities C 
				INNER JOIN master_city_list MCL 
				ON C.id = MCL.city_id AND MCL.master_id = M.id
			) AS cities 
		FROM masters M WHERE id=$1;`, [id]);
	return result.rows;
};

const updateMasterById = async (id, master) => {
	console.log('updateMasterById: ', id, master);
	//'UPDATE cities SET name=$1 WHERE id=($2);', [cityName, id]);
	let result = await execQuery(	
		`UPDATE masters SET name=$1, email=$2, rating=$3 WHERE id=($4)`,
		[master.name, master.email, master.rating, id]
	);
	return result.rows;
};

module.exports = { pool, execQuery, getUser, getWatchTypes, 
	getCities, createCity, deleteCityById, getCityById, updateCityById,
	getMasters, createMaster, deleteMasterById, getMasterById, updateMasterById
};

  