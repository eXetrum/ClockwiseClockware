const { execQuery } = require('./db');

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
	
	console.log('[db] getMasters');
	let result = await execQuery(
	`SELECT M.id, M.name, M.email, M.rating, json_agg(C.*) as cities
	FROM 
		masters M
		INNER JOIN master_city_list MCL ON M.id=MCL.master_id
		INNER JOIN cities C ON C.id = MCL.city_id AND MCL.master_id = M.id
	GROUP BY M.id
	ORDER BY id`);
	console.log('[db] getMasters result: ', result.rows);
	return result.rows;
};

const createMaster = async (master) => {
	console.log('[db] createMaster: ', master);
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
	console.log('[db] createMaster result: ', result.rows);
	return result.rows;
};

const deleteMasterById = async (id) => {
	console.log('[db] deleteMasterById: ', id);
	let result = await execQuery(
		`DELETE
		FROM
			masters AS ma
		USING
			master_city_list AS mcl
		WHERE
			ma.id=mcl.master_id
		AND ma.id=($1);`, [id]);
	console.log('[db] deleteMasterById result: ', result.rows);
	return result.rows;
};

const getMasterById = async (id) => {
	console.log('[db] getMasterById: ', id);
	let result = await execQuery(
		`SELECT id, name, email, rating, (
			SELECT json_agg(C.*) 
			FROM 
				cities C 
				INNER JOIN master_city_list MCL 
				ON C.id = MCL.city_id AND MCL.master_id = M.id
			) AS cities 
		FROM masters M WHERE id=$1;`, [id]);
	console.log('[db] getMasterById result: ', result.rows);
	return result.rows;
};

const updateMasterById = async (id, master) => {
	console.log('[db] updateMasterById result: ', id, master);
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
	
	console.log('[db] updateMasterById, dbMasterCities: ', dbMasterCities);
	console.log('[db] updateMasterById, remoteMasterCities: ', remoteMasterCities);
	
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
	console.log('[db] updateMasterById result: ', result.rows);
	return result.rows;
};

module.exports = { getMasters, createMaster, deleteMasterById, getMasterById, updateMasterById };