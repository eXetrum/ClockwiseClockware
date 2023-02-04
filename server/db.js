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
	/*let result = await execQuery(
	`SELECT id, name, email, rating, (
			SELECT json_agg(C.*) 
			FROM 
				cities C 
				INNER JOIN master_city_list MCL 
				ON C.id = MCL.city_id AND MCL.master_id = M.id
			) AS cities 
	FROM masters M;`);*/
	let result = await execQuery(
	`SELECT M.id, M.name, M.email, M.rating, json_agg(C.*) as cities
	FROM 
		masters M
		INNER JOIN master_city_list MCL ON M.id=MCL.master_id
		INNER JOIN cities C ON C.id = MCL.city_id AND MCL.master_id = M.id
	GROUP BY M.id`);
	return result.rows;
};

const createMaster = async (master) => {
	console.log('createMaster before query: ', master);
	let cities = [];
	master.cities.forEach(item => cities.push(item.id));
	
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
	`, [master.name, master.email, master.rating, cities]);
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
	let result = await execQuery(
		`SELECT id, name, email, rating, (
			SELECT json_agg(C.*) 
			FROM 
				cities C 
				INNER JOIN master_city_list MCL 
				ON C.id = MCL.city_id AND MCL.master_id = M.id
			) AS cities 
		FROM masters M WHERE id=$1;`, [id])
	
	let dbMaster = result.rows[0];
	dbMasterCities = dbMaster.cities.map(item => item.id);
	remoteMasterCities = master.cities.map(item => item.id);
	
	console.log('updateMasterById, dbMasterCities: ', dbMasterCities);
	console.log('updateMasterById, remoteMasterCities: ', remoteMasterCities);
	
	let toRemove = dbMasterCities.filter(item => remoteMasterCities.indexOf(item) == -1);
	let toInsert = remoteMasterCities.filter(item => dbMasterCities.indexOf(item) == -1);

	await Promise.all(toRemove.map(item => {
		return execQuery('DELETE FROM master_city_list WHERE master_id=($1) AND city_id=($2)', [id, item]);
	}));
	
	result = await execQuery(`
			WITH update_master AS (
			UPDATE masters SET name=$1, email=$2, rating=$3 WHERE id=($4)
			returning id
		)
		INSERT INTO master_city_list (master_id, city_id)
		VALUES(
			(SELECT id FROM update_master),
			unnest($5::integer[])
		)`, [master.name, master.email, master.rating, id, toInsert]
	);	
	
	return result.rows;
};

/////////////////////////////////////////////////////////////////////// Everything about order
const getWatchTypes = async () => {
	let result = await execQuery('SELECT * FROM watch_type');
	return result.rows;
};

const getAvailableMasters = async (cityId, watchTypeId, dateTime) => {
	console.log('[db] getAvailableMasters query params: ', cityId, watchTypeId, dateTime)
	let result = await execQuery(
	`SELECT M.id, M.name, M.email, M.rating, json_agg(C.*) as cities
	FROM 
		masters M
		INNER JOIN master_city_list MCL ON M.id=MCL.master_id
		INNER JOIN cities C ON C.id = MCL.city_id AND MCL.master_id = M.id
	WHERE M.id IN (
		SELECT M.id
		FROM 
			masters M
			INNER JOIN master_city_list MCL ON M.id=MCL.master_id
			INNER JOIN cities C ON C.id = MCL.city_id AND MCL.master_id = M.id
			WHERE C.id=($1)
		GROUP BY M.id
	)
	GROUP BY M.id
	HAVING M.id NOT IN (
		SELECT master_id
		FROM
		(
			SELECT master_id, date_time as start_date, date_time + interval '1h' * repair_time as end_date
			FROM 
				watch_type W
				INNER JOIN booking B ON B.watch_type_id=W.id
		) InnerSubQ
		WHERE (
			(InnerSubQ.start_date, InnerSubQ.end_date) 
			OVERLAPS
			(
				to_timestamp ($2), 
				to_timestamp ($2) + interval '1h' * (SELECT repair_time FROM watch_type WHERE id=($3) LIMIT 1) 
			)
		)
	);
	`, [cityId, dateTime / 1000, watchTypeId]);

	let cityMasters = result.rows;
	console.log('[db] getAvailableMasters masters by city result: ', cityMasters);
	
	let masters = result.rows;//.filter(item => item.city.id == cityId);
	
	console.log('[db] getAvailableMasters result filtered: ', masters);
	return masters;
};

const placeOrder = async (client, master) => {
	console.log('[db] placeOrder: ', client, master);

	let result = await execQuery(`
		WITH new_client AS(
			INSERT INTO clients (name, email)
			VALUES ($1, $2)
			ON CONFLICT (email) DO UPDATE SET name=($1)
			RETURNING id
		)
		INSERT INTO booking (client_id, watch_type_id, city_id, master_id, date_time)
		VALUES ((SELECT id FROM new_client), $3, $4, $5, to_timestamp($6))
	`, [client.name, client.email, client.watchType.id, client.city.id, master.id, client.dateTime / 1000]);
	return result.rows;
};

const getOrders = async () => {
	console.log('[db] getOrders');
	let result = await execQuery(`
		SELECT B.id, 
			client_id, json_build_object('id', CL.id, 'name', CL.name, 'email', CL.email) AS client, 
			master_id, json_build_object('id', M.id, 'name', M.name, 'email', M.email, 'rating', M.rating) as master,
			city_id, json_build_object('id', C.id, 'name', C.name) as city,
			watch_type_id, json_build_object('id', W.id, 'name', W.name, 'repair_time', W.repair_time, 'start_date', B.date_time, 'end_date', B.date_time + interval '1h' * W.repair_time) as watch_type
			FROM 
				booking B 
				INNER JOIN watch_type W ON B.watch_type_id=W.id
				INNER JOIN clients CL ON B.client_id=CL.id
				INNER JOIN masters M ON B.master_id=M.id
				INNER JOIN cities C ON B.city_id=C.id
				
		;
	`);
	return result.rows;
};
///////////////////////////////////////////////////////////
const getClients = async () => {
	console.log('[db] getClients');
	let result = await execQuery('SELECT * FROM clients');
	return result.rows;
};

const deleteClientById = async (id) => {
	// TODO
};

const getClientById = async (id) => {
	// TODO
};

const updateClientById = async (id, client) => {
	// TODO
};
///////////////////////////////////////////////////////////


module.exports = { pool, execQuery, getUser, 
	getCities, createCity, deleteCityById, getCityById, updateCityById,
	getMasters, createMaster, deleteMasterById, getMasterById, updateMasterById, 
	getWatchTypes, getAvailableMasters, placeOrder, getOrders,
	getClients, deleteClientById, getClientById, updateClientById
};

  