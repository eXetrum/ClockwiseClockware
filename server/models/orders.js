const { execQuery } = require('./db');

const getWatchTypes = async () => {
	console.log('[db] getWatchTypes');
	let result = await execQuery('SELECT * FROM watch_type ORDER BY id');
	console.log('[db] getWatchTypes result: ', result.rows);
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
				INNER JOIN orders O ON O.watch_type_id=W.id
		) InnerSubQ
		WHERE (
			(InnerSubQ.start_date, InnerSubQ.end_date) 
			OVERLAPS
			(
				to_timestamp ($2), 
				to_timestamp ($2) + interval '1h' * (SELECT repair_time FROM watch_type WHERE id=($3) LIMIT 1) 
			)
		)
	)
	ORDER BY M.rating DESC;
	`, [cityId, dateTime / 1000, watchTypeId]);

	console.log('[db] getAvailableMasters free masters: ', result.rows);
	return result.rows;
};

const createOrder = async (order) => {
	console.log('[db] createOrder: ', order);

	let result = await execQuery(`
		WITH new_client AS(
			INSERT INTO clients (name, email)
			VALUES ($1, $2)
			ON CONFLICT (email) DO UPDATE SET name=($1)
			RETURNING id
		)
		INSERT INTO orders (client_id, watch_type_id, city_id, master_id, date_time)
		VALUES ((SELECT id FROM new_client), $3, $4, $5, to_timestamp($6))
	`, [order.client.name, order.client.email, order.watchType.id, order.city.id, order.master.id, order.dateTime / 1000]);
	
	console.log('[db] createOrder result: ', result.rows);
	return result.rows;
};

const getOrders = async () => {
	console.log('[db] getOrders');
	let result = await execQuery(`
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
		ORDER BY O.id				
		;
	`);
	console.log('[db] getOrders result: ', result.rows);
	return result.rows;
};

const deleteOrderById = async (id) => {
	console.log('[db] deleteOrderById ', id);
	let result = await execQuery(`DELETE FROM orders WHERE id=($1);`, [id]);
	console.log('[db] deleteOrderById result: ', result.rows);
	return result.rows;
};

const getOrderById = async (id) => {
	console.log('[db] getOrderById ', id);
	let result = await execQuery(`
		SELECT O.id, 
			json_build_object('id', CL.id, 'name', CL.name, 'email', CL.email) AS client, 
			json_build_object('id', M.id, 'name', M.name, 'email', M.email, 'rating', M.rating, 'cities', (
			SELECT json_agg(C.*) 
			FROM 
				cities C 
				INNER JOIN master_city_list MCL 
				ON C.id = MCL.city_id AND MCL.master_id = M.id
			)) as master,
			json_build_object('id', C.id, 'name', C.name) as city,
			json_build_object('id', W.id, 'name', W.name, 'repairTime', W.repair_time) as "watchType",
			json_build_object('startDate', O.date_time, 'endDate', O.date_time + interval '1h' * W.repair_time) as "dateTime"
			FROM 
				orders O 
				INNER JOIN watch_type W ON O.watch_type_id=W.id
				INNER JOIN clients CL ON O.client_id=CL.id
				INNER JOIN masters M ON O.master_id=M.id
				INNER JOIN cities C ON O.city_id=C.id
			WHERE O.id=($1)
		ORDER BY O.id				
		;
	`, [id]);
	console.log('[db] deleteOrderById result: ', result.rows);
	return result.rows;
};

const updateOrderById = async (id) => {
	throw "NOT IMPLEMENTED";
};



module.exports = { getWatchTypes, getAvailableMasters, createOrder, getOrders, deleteOrderById, getOrderById, updateOrderById };