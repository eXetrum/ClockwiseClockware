const { RouteProtector } = require('../middleware/RouteProtector');
const { body, param, query, validationResult } = require('express-validator');
const { sendEmail } = require('../middleware/NodeMailer');
const { getWatchTypes, getAvailableMasters, createOrder, getOrders, deleteOrderById, getOrderById, updateOrderById } = require('../models/orders');

const moment = require('moment');

const dateToNearestHour = (date) => {
	const ms = 1000 * 60 * 60;
	return new Date(Math.ceil(date.getTime() / ms) * ms);
};

///////// Client part (No route protection)
const getWatches = async (req, res) => {
	try {
		console.log('[route] GET /watch_types');
		let watchTypes = await getWatchTypes();
		console.log('[route] GET /watch_types result: ', watchTypes);
		res.status(200).json({ watchTypes }).end();
	} catch(e) { console.log(e); res.status(400).end();}
};

const getFreeMasters = [
	query('cityId').exists().withMessage('"cityId" required')
		.isInt({min: 0}).withMessage('"cityId" should be of type int'),
	query('watchTypeId').exists().withMessage('"watchTypeId" required')
		.isInt({min: 0}).withMessage('"watchTypeId" should be of type int'),
	query('timestamp').exists().withMessage('"timestamp" required')
		.isInt({min: 0}).toInt().withMessage('"timestamp" required should be of type int'),
	query('clientTimezone').exists().withMessage('"clientTimezone" required')
		.isInt().toInt().withMessage('"clientTimezone" required should be of type int'),
	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			
			let { cityId, watchTypeId, timestamp, clientTimezone } = req.query;
			
			
			console.log('[route] GET /available_masters query params: ', cityId, watchTypeId, timestamp);
			const clientDateTime = new Date(timestamp);
			const now = new Date();
			const withRespectToClientTZ = new Date(now.setTime(now.getTime() - clientTimezone * 60 * 1000 ))
			console.log('[route] GET /available_masters clientDateTime:  ', clientDateTime);
			console.log('[route] GET /available_masters backendDateTime: ', now);
			console.log('[route] GET /available_masters backendDateTimTZ:', withRespectToClientTZ);
			console.log('[route] GET /availWidth local timestamp: ', clientDateTime.getTime());
			console.log('[route] GET /availWidth local timestamp: ', withRespectToClientTZ.getTime());
			
			
			timestamp = dateToNearestHour(withRespectToClientTZ).getTime() / 1000;
			console.log('[route] GET /available_masters query params: ', cityId, watchTypeId, timestamp);
			
			let masters = await getAvailableMasters(cityId, watchTypeId, timestamp);
			console.log('[route] GET /available_masters result: ', masters);
			res.status(200).json({ masters }).end();
		} catch(e) { console.log(e); res.status(400).end(); }
	}
];

const create = [
	body('order').exists().withMessage('order object required')
		.isObject().withMessage('order object required'),
	body('order.client').exists().withMessage('order.client object required')
		.isObject().withMessage('order.client object required'),
	body('order.client.name').exists().withMessage('order.client.name required')
		.isString().withMessage('Client name should be of type string')
		.trim().escape().isLength({min: 3}).withMessage('Empty client name is not allowed min len=3)'),
	body('order.client.email').exists().withMessage('order.client.email required')
		.isString().withMessage('Client email should be of type string')
		.trim().escape().notEmpty().withMessage('Empty client email is not allowed')
		.isEmail().withMessage('Client email is not correct'),
	body('order.watchTypeId').exists().withMessage('order.watchTypeId required')
		.not().isArray().withMessage('order.watchTypeId should be of type int')
		.isInt({min: 0}).withMessage('order.watchTypeId should be of type int'),
	body('order.cityId').exists().withMessage('order.cityId required')
		.not().isArray().withMessage('order.cityId should be of type int')
		.isInt({min: 0}).withMessage('order.cityId should be of type int'),
	body('order.masterId').exists().withMessage('order.masterId required')
		.not().isArray().withMessage('order.masterId should be of type int')
		.isInt({min: 0}).withMessage('order.masterId should be of type int'),
	body('order.startDate').exists().withMessage('order.startDate required'),
		/*.isString().withMessage('order.startDate should be of type string(ex. new Date().toString())')
		.trim().escape().notEmpty().withMessage('Empty order.startDate is not allowed')
		.custom((value, { req }) => { 
			const curDate = new Date();
			const orderDate = new Date(value);
			if(orderDate == 'Invalid date') { throw new Error('Invalid date'); }
			if(orderDate < curDate) { throw new Error('Past date time is not allowed'); }
			
			// Indicates the success of this synchronous custom validator
			return true;
		}).withMessage('order.startDate should be of type int'),*/
	
	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			}
	
			let { order } = req.body;
			let d = moment(order.startDate);
			console.log('=>>', d, typeof d);
			//d.setTime(d.geTime() + d.getTimezoneOffset() * 60 * 1000);
			console.log('[route] POST /orders ', order);
			console.log('[route] POST /orders DATE: ', d);
			//console.log('orig date str: ', d);
			//console.log('local tostr: ', d.toString());
			//console.log('local GMT: ', d.toGMTString());
			//console.log('local ISO: ', d.toISOString());
			//console.log('local UTC: ', d.toUTCString());
			const nearestDate = dateToNearestHour(d);
			console.log('[route] POST /orders NEAREST DATE: ', nearestDate);
			order.client.name = order.client.name.trim();
			order.client.email = order.client.email.trim();
			order.startDate = nearestDate.getTime() / 1000;
			
			console.log('[route] POST /orders ', order);
			let result = await createOrder(order);
			console.log('[route] POST /orders result: ', result);
			//const masters = await getAvailableMasters(order.city.id, order.watchType.id, order.dateTime)
			//console.log('[route] POST /orders result array of masters: ', masters);
			
			/*
			let startDate = new Date(order.startDate);
			let endDate = new Date(order.startDate);
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
			*/
			
			//let info = await sendMail(params);

			//console.log(info);
			// DUMMY DUE TESTS
			const info = {messageId: 42};

			res.status(201).json({ info }).end();
			
		} catch(e) { 
			console.log(e); 
			console.log(e.constraint);
			if(e.constraint == 'unknown_watchTypeId') {
				return res.status(409).json({ detail: 'Incorrect watchTypeId'});
			} else if(e.constraint == 'orders_city_id_fkey') {
				return res.status(409).json({ detail: 'Incorrect cityId'});
			} else if(e.constraint == 'orders_master_id_fkey') {
				return res.status(409).json({ detail: 'Incorrect masterId'});
			} else if(e.constraint == 'overlapping_times') {
				return res.status(409).json({ detail: 'Master cant handle this order at specified datetime'});
			}
			
			res.status(400).end(); 
		}
	}
];

///////// Admin part (WITH route protection)
const getAll = [
	RouteProtector, 
	async (req, res) => {
		try {
			console.log('[route] GET /orders');
			let orders = await getOrders();
			console.log('[route] GET /orders result: ', orders);
			res.status(200).json({ orders }).end();
		} catch(e) { console.log(e); res.status(400).json(e).end(); }
	}
];

const remove = [
	RouteProtector, 
	param('id').exists().notEmpty().isInt().toInt().withMessage('Order ID must be integer value'),
	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			}
			const { id } = req.params;
			console.log('[route] DELETE /orders/:id ', id);
			
			let result = await deleteOrderById(id);
			console.log('[route] DELETE /orders/:id result: ', result);
			if(Array.isArray(result) && result.length == 0) {
				return res.status(404).json({ detail: 'Order not found' }).end();
			}
			res.status(204).end();
		} catch(e) { console.log(e); res.status(400).json(e).end(); }
	}
];

const get = [
	RouteProtector, 
	param('id').exists().notEmpty().isInt().toInt().withMessage('Order ID must be integer value'),
	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			}
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
	}
];

const update = [ 
	RouteProtector, 
	param('id').exists().notEmpty().isInt().toInt().withMessage('Order ID must be integer value'),
	body('order').exists().withMessage('order object required')
		.isObject().withMessage('order object required'),
	body('order.client').exists().withMessage('order.client object required')
		.isObject().withMessage('order.client object required'),
	body('order.client.name').exists().withMessage('order.client.name required')
		.isString().withMessage('Client name should be of type string')
		.trim().escape().isLength({min: 3}).withMessage('Empty client name is not allowed min len=3)'),
	body('order.client.email').exists().withMessage('order.client.email required')
		.isString().withMessage('Client email should be of type string')
		.trim().escape().notEmpty().withMessage('Empty client email is not allowed')
		.isEmail().withMessage('Client email is not correct'),
	body('order.watchTypeId').exists().withMessage('order.watchTypeId required')
		.not().isArray().withMessage('order.watchTypeId should be of type int')
		.isInt({min: 0}).withMessage('order.watchTypeId should be of type int'),
	body('order.cityId').exists().withMessage('order.cityId required')
		.not().isArray().withMessage('order.cityId should be of type int')
		.isInt({min: 0}).withMessage('order.cityId should be of type int'),
	body('order.masterId').exists().withMessage('order.masterId required')
		.not().isArray().withMessage('order.masterId should be of type int')
		.isInt({min: 0}).withMessage('order.masterId should be of type int'),
	body('order.startDate').exists().withMessage('order.startDate required')
		.not().isArray().withMessage('order.startDate should be of type int')
		.isInt({min: 0}).withMessage('order.startDate should be of type int'),

	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			const { id } = req.params;
			let { order } = req.body;
			console.log('[route] PUT /orders/:id ', id, order);
			console.log('[route] PUT /orders DATE: ', new Date(order.startDate));
			const nearestDate = dateToNearestHour(new Date(order.startDate));
			console.log('[route] PUT /orders NEAREST DATE: ', nearestDate);
			order.client.name = order.client.name.trim();
			order.client.email = order.client.email.trim();
			order.startDate = nearestDate.getTime() / 1000;			
			let result = await updateOrderById(id, order);
			console.log('[route] PUT /orders/:id update result: ', result);
			order = result[0];
			console.log('[route] PUT /orders/:id result: ', order);
			if(!order) {
				res.status(404).json({message: 'Order not found'}).end();
			} else {
				res.status(200).json({ order }).end();
			}
		} catch(e) { 
			console.log(e); 
			if(e.constraint == 'unknown_watchTypeId') {
				return res.status(409).json({ detail: 'Incorrect watchTypeId'});
			} else if(e.constraint == 'orders_city_id_fkey') {
				return res.status(409).json({ detail: 'Incorrect cityId'});
			} else if(e.constraint == 'orders_master_id_fkey') {
				return res.status(409).json({ detail: 'Incorrect masterId'});
			} else if(e.constraint == 'overlapping_times') {
				return res.status(409).json({ detail: 'Master cant handle this order at specified datetime'});
			}
			res.status(400).end(); 
		}
	}
];

module.exports = {
	getWatches, getFreeMasters, create, getAll, remove, get, update
};