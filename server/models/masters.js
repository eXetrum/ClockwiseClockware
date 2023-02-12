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
	`SELECT M.id, M.name, M.email, M.rating, json_agg(C.*) as cities, 
	(
		SELECT json_agg(T.*)
		
		FROM (
			SELECT O.id, 
				json_build_object('id', CL.id, 'name', CL.name, 'email', CL.email) AS client, 
				json_build_object('id', M.id, 'name', M.name, 'email', M.email, 'rating', M.rating) as master,
				json_build_object('id', C.id, 'name', C.name) as city,
				json_build_object('id', W.id, 'name', W.name, 'repairTime', W.repair_time) as "watchType",
				json_build_object('startDate', O.date_time, 'endDate', O.date_time + interval '1h' * W.repair_time) as "dateTime"
				FROM 
					orders O
					INNER JOIN watch_type W ON O.watch_type_id=W.id
					INNER JOIN clients CL ON O.client_id=CL.id
					INNER JOIN masters M2 ON O.master_id=M2.id
					INNER JOIN cities C ON O.city_id=C.id
			WHERE O.master_id = M.id
			ORDER BY O.date_time
		) T
		
	) AS orders
	FROM 
		masters M
		LEFT JOIN master_city_list MCL ON M.id=MCL.master_id
		LEFT JOIN cities C ON C.id = MCL.city_id AND MCL.master_id = M.id
	GROUP BY M.id
	ORDER BY id`);
	result.rows = result.rows.map(item => {
		if(item.cities == null || item.cities == undefined) item.cities = [];
		item.cities = item.cities.filter(city => city);
		if(item.orders == null || item.cities == undefined) item.orders = [];
		item.orders = item.orders.filter(order => order);
		return item;
	});
	console.log('[db] getMasters result: ', result.rows);
	return result.rows;
};

const createMaster = async (master) => {
	console.log('[db] createMaster: ', master);
	if(master.cities == null || master.cities == undefined) master.cities = [];
	master.cities = master.cities.map(item => item.id);
	
	let result = await execQuery(`SELECT * from cities`);
	let dbCities = result.rows.map(item => item.id);
	console.log('[db] createMaster db cities: ', dbCities);
	
	// Remove non existing city ids
	console.log('[db] createMaster master cities before filter: ', master.cities);;
	master.cities = master.cities.filter(item => dbCities.indexOf(item) != -1);
	if(master.cities.length == 0) {
		result = await execQuery(
		`INSERT INTO masters (name, email, rating)
			VALUES ($1, $2, $3)
		RETURNING id;
		`, [master.name, master.email, master.rating]);
	} else {	
		result = await execQuery(
			`WITH new_master AS(
				INSERT INTO masters (name, email, rating)
				VALUES ($1, $2, $3)
				RETURNING id
			)
			INSERT INTO master_city_list (master_id, city_id)
			VALUES(
				(SELECT id FROM new_master),
				unnest($4::integer[])
			)
			RETURNING master_id as "id";
		`, [master.name, master.email, master.rating, master.cities]);
	}
	console.log('[db] createMaster insertion result: ', result.rows);
	result = await execQuery(
	`SELECT id, name, email, rating, (
			SELECT json_agg(C.*) 
			FROM 
				cities C 
				INNER JOIN master_city_list MCL 
				ON C.id = MCL.city_id AND MCL.master_id = M.id
			) AS cities 
	FROM masters M
	WHERE M.id=($1);`, [result.rows[0].id]);
	result.rows = result.rows.map(item => {
		if(item.cities == null || item.cities == undefined) item.cities = [];
		item.cities = item.cities.filter(city => city);
		if(item.orders == null || item.cities == undefined) item.orders = [];
		return item;
	});
	console.log('[db] createMaster selection result: ', result.rows);
	return result.rows;
};

const deleteMasterById = async (id) => {
	console.log('[db] deleteMasterById: ', id);
	let result = await execQuery(
		`DELETE
		FROM
			masters
		WHERE id=($1) RETURNING *;`, [id]);
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
			) AS cities,(
				SELECT json_agg(T.*)
				
				FROM (
					SELECT O.id, 
						json_build_object('id', CL.id, 'name', CL.name, 'email', CL.email) AS client, 
						json_build_object('id', M.id, 'name', M.name, 'email', M.email, 'rating', M.rating) as master,
						json_build_object('id', C.id, 'name', C.name) as city,
						json_build_object('id', W.id, 'name', W.name, 'repairTime', W.repair_time) as "watchType",
						json_build_object('startDate', O.date_time, 'endDate', O.date_time + interval '1h' * W.repair_time) as "dateTime"
						FROM 
							orders O
							INNER JOIN watch_type W ON O.watch_type_id=W.id
							INNER JOIN clients CL ON O.client_id=CL.id
							INNER JOIN masters M ON O.master_id=M.id
							INNER JOIN cities C ON O.city_id=C.id
					WHERE O.master_id = ($1)
					ORDER BY O.date_time
				) T
				
			) AS orders
		FROM masters M WHERE M.id=$1;`, [id]);
		
	result.rows = result.rows.map(item => {
		if(item.cities == null || item.cities == undefined) item.cities = [];
		item.cities = item.cities.filter(city => city);
		if(item.orders == null || item.cities == undefined) item.orders = [];
		item.orders = item.orders.filter(order => order);
		return item;
	});
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
	if(dbMaster == null || dbMaster == undefined) {
		return [];
	}
	dbMasterCities = (dbMaster.cities == null || dbMaster.cities == undefined) ? [] : dbMaster.cities.filter(city => city).map(item => item.id);
	remoteMasterCities = master.cities.map(item => item.id);
	
	result = await execQuery(`SELECT * from cities`);
	let dbCities = result.rows.map(item => item.id);
	
	// Remove non existing city ids
	remoteMasterCities = remoteMasterCities.filter(item => dbCities.indexOf(item) != -1);
	
	console.log('[db] updateMasterById, dbCities: ', dbCities);
	console.log('[db] updateMasterById, dbMasterCities: ', dbMasterCities);
	console.log('[db] updateMasterById, remoteMasterCities: ', remoteMasterCities);
	// Intersect
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
	
	
	result = await getMasterById(id);
		
	result = result.map(item => {
		if(item.cities == null || item.cities == undefined) item.cities = [];
		item.cities = item.cities.filter(city => city);
		if(item.orders == null || item.cities == undefined) item.orders = [];
		item.orders = item.orders.filter(order => order);
		return item;
	});
	
	return result;
};

module.exports = { getMasters, createMaster, deleteMasterById, getMasterById, updateMasterById };