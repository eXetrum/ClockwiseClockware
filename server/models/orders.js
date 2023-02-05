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
		INSERT INTO booking (client_id, watch_type_id, city_id, master_id, date_time)
		VALUES ((SELECT id FROM new_client), $3, $4, $5, to_timestamp($6))
	`, [order.client.name, order.client.email, order.watchType.id, order.city.id, order.master.id, order.dateTime / 1000]);
	
	console.log('[db] createOrder result: ', result.rows);
	const masters = await getAvailableMasters(order.city.id, order.watchType.id, order.dateTime)
	console.log('[db] createOrder result array of masters: ', masters);
	return masters;
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
		ORDER BY B.id				
		;
	`);
	console.log('[db] getOrders result: ', result.rows);
	return result.rows;
};

const deleteOrderById = async (id) => {
	console.log('[db] deleteOrderById ', id);
	let result = await execQuery(`DELETE FROM booking WHERE id=($1);`, [id]);
	console.log('[db] deleteOrderById result: ', result.rows);
	let orders = await getOrders();
	console.log('[db] deleteOrderById result orders array: ', orders);
	return orders;
};


module.exports = { getWatchTypes, getAvailableMasters, createOrder, getOrders, deleteOrderById };