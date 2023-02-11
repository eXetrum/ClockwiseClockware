require('dotenv').config();
const router = require('express').Router();
const { RouteProtector } = require('../middleware/RouteProtector');
const { getWatchTypes, getAvailableMasters, createOrder, getOrders, deleteOrderById, getOrderById, updateOrderById } = require('../models/orders');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
	service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_AUTH_GMAIL_USER,
        pass: process.env.NODEMAILER_AUTH_GMAIL_APP_PASS
    }
});


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
		let result = await createOrder(order);
		console.log('[route] POST /orders result: ', result);
		//const masters = await getAvailableMasters(order.city.id, order.watchType.id, order.dateTime)
		//console.log('[route] POST /orders result array of masters: ', masters);
		
		let startDate = new Date(order.dateTime);
		let endDate = new Date(order.dateTime);
		endDate.setHours(endDate.getHours() + order.watchType.repairTime);
		
		const params = {
			from: `${process.env.NODEMAILER_AUTH_GMAIL_USER}@gmail.com`,
			to: order.client.email,
			subject: 'Your order details at ClockwiseClockware',
			text: '',
			html: `
			<p>Mr(s) ${order.client.name} thank you for trusting us to do the repair work !</p><br/>
			<p>Order details:</p>
			<table>
				<thead>
					<tr>
						<th>Master</th>
						<th>City</th>
						<th>Watch type</th>						
						<th>Start Date</th>
						<th>End Date</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><b>${order.master.name}</b>, <i>${order.master.email}</i></td>
						<td>${order.city.name}</td>
						<td>${order.watchType.name}</td>						
						<td>${startDate}</td>
						<td>${endDate}</td>
					</tr>
				</tbody>
			</table>`, // html body
		};
		console.log(params);
		
		//let info = await transporter.sendMail(params);

		//console.log(info);
		// DUMMY DUE TESTS
		const info = {messageId: 42};

		res.status(201).json({ info }).end();
		
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
	} catch(e) { console.log(e); res.status(400).json(e).end(); }
});

router.delete('/api/orders/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('[route] DELETE /orders/:id ', id);
		let result = await deleteOrderById(id);
		console.log('[route] DELETE /orders/:id result: ', result);
		let orders = await getOrders();
		console.log('[route] DELETE /orders/:id result orders array: ', orders);
		res.status(200).json({
			orders
		}).end();
	} catch(e) { console.log(e); res.status(400).json(e).end(); }
});

router.get('/api/orders/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('[route] GET /orders/:id ', id);
		let result = await getOrderById(id);
		console.log('[route] GET /orders/:id result: ', result);
		let order = result[0];
		console.log('[route] GET /orders/:id result: ', order);
		if(!order) {
			res.status(404).json({message: 'Record Not Found'}).end();
		} else {
			res.status(200).json({ order }).end();
		}
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.put('/api/orders/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		let { order } = req.body;
		console.log('[route] PUT /orders/:id ', id, order);
		let result = await updateOrderById(id, order);
		console.log('[route] PUT /orders/:id update result: ', result);
		result = await getOrderById(id);
		console.log('[route] PUT /orders/:id getbyid result: ', result);
		order = result[0];
		console.log('[route] PUT /orders/:id result: ', order);
		if(!order) {
			res.status(404).json({message: 'Record Not Found'}).end();
		} else {
			res.status(200).json({ order }).end();
		}
	} catch(e) { console.log(e); res.status(400).end(); }
});

module.exports = router;