const router = require('express').Router();
const { RouteProtector } = require('../middleware/RouteProtector');
const { getWatchTypes, getAvailableMasters, placeOrder, getOrders } = require('../models/booking');

router.get('/api/watch_types', RouteProtector, async (req, res) => {
	try {
		console.log('[route] GET /watch_types');
		let watchTypes = await getWatchTypes();
		console.log('[route] GET /watch_types result: ', watchTypes);
		res.status(200).json({
			watchTypes
		}).end();
	} catch(e) { console.log(e); res.status(400).end();}
});

router.get('/api/available_masters', RouteProtector, async (req, res) => {
	try {
		let { cityId, watchTypeId, dateTime } = req.query;
		console.log('[route] GET /available_masters query params: ', cityId, watchTypeId, dateTime);
		let masters = await getAvailableMasters(cityId, watchTypeId, dateTime);
		console.log('[route] GET /available_masters result: ', masters);
		res.status(200).json({
			masters
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.post('/api/place_order', RouteProtector, async (req, res) => {
	try {
		const { client, master } = req.body;
		console.log('[route] POST /place_order ', client, master);
		let result = await placeOrder(client, master);
		console.log('[route] POST /place_order result: ', result);
		res.status(201).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.get('/api/orders', RouteProtector, async (req, res) => {
	try {
		console.log('[route] GET /orders');
		let orders = await getOrders();
		console.log('[route] GET /orders result: ', orders);
		res.status(200).json({
			orders
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

module.exports = router;