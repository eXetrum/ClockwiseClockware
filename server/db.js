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
	let joined = await execQuery('SELECT * FROM masters AS M INNER JOIN master_city_list AS MCL ON M.id=MCL.master_id INNER JOIN cities AS C ON C.id=MCL.city_id');
	let result = [];
	console.log(joined.rows.length, joined.rows);
	for(let i = 0; i < joined.rows.length; ++i) {
		const item = joined.rows[i];
		console.log(item);
		const idx = result.map(item => item.master_id).indexOf(item.master_id);
		if(idx == -1) {
			result.push({
				master_id: item.master_id,
				master_name: item.master_name,
				master_email: item.master_email,
				master_rating: item.master_rating,
				cities: [{city_id: item.city_id, city_name: item.city_name}],
			});
		} else {
			result[idx].cities.push({city_id: item.city_id, city_name: item.city_name});
		}
	}
	
	return result;
};

const createMaster = async (cityName) => {
	console.log('createMaster: ', cityName);
	await execQuery('INSERT INTO cities (name) VALUES ($1);', [cityName]);
	let result = await execQuery('SELECT * FROM cities');
	console.log('createCity: ', result.rows);
	return result.rows;
};

const deleteMasterById = async (id) => {
	console.log('deleteMasterById: ', id);
	let result = await execQuery('DELETE FROM cities WHERE id=($1);', [id]);
	return result.rows;
};

const getMasterById = async (id) => {
	console.log('getMasterById: ', id);
	let result = await execQuery('SELECT * FROM cities WHERE id=($1);', [id]);
	return result.rows;
};

const updateMasterById = async (id, cityName) => {
	console.log('updateMasterById: ', id, cityName);
	let result = await execQuery('UPDATE cities SET name=$1 WHERE id=($2);', [cityName, id]);
	return result.rows;
};

module.exports = { pool, execQuery, getUser, getWatchTypes, 
	getCities, createCity, deleteCityById, getCityById, updateCityById,
	getMasters, createMaster, deleteMasterById, getMasterById, updateMasterById
};

  