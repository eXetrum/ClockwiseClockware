const router = require('express').Router();
const { RouteProtector } = require('../middleware/RouteProtector');
const { getWatchTypes, getAvailableMasters, createOrder, getOrders, deleteOrderById } = require('../models/orders');

///////// Client part (No route protection)
router.get('/api/watch_types', async (req, res) => {
	try {
		console.log('[route] GET /watch_types');
		let watchTypes = await getWatchTypes();
		console.log('[route] GET /watch_types result: ', watchTypes);
		res.status(200).json({
			watchTypes
		}).end();
	} catch(e) { console.log(e); res.status(400).end();}
});

router.get('/api/available_masters', async (req, res) => {
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

router.post('/api/orders', async (req, res) => {
	try {
		const { order } = req.body;
		console.log('[route] POST /orders ', order);
		let masters = await createOrder(order);
		console.log('[route] POST /orders result: ', masters);
		res.status(201).json({
			masters
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

///////// Admin part (WITH route protection)
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

router.delete('/api/orders/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('[route] DELETE /orders/:id ', id);
		let orders = await deleteOrderById(id);
		console.log('[route] DELETE /orders/:id result: ', orders);
		res.status(200).json({
			orders
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

module.exports = router;