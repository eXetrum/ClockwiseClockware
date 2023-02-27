const { RouteProtector } = require('../middleware/RouteProtector');
const { body, param, query, validationResult } = require('express-validator');
const { sendMail } = require('../middleware/NodeMailer');
const moment = require('moment');
const { Op, Sequelize } = require('sequelize');
const db = require('../database/models/index');
const { Order, Client, Watches, City, Master, MasterCityList } = require('../database/models');

//const { getAvailableMasters, createOrder, getOrders, deleteOrderById, getOrderById, updateOrderById } = require('../models/orders');
//const { getMasterById } = require('../models/masters');
//const { getCityById } = require('../models/cities');




/*const getWatchTypes = () => {
	return null;
};*/


const dateToNearestHour = (timestamp) => {
	const ms = 1000 * 60 * 60;
	return Math.ceil(timestamp / ms) * ms;
};

// +
const getFreeMasters = [
	query('cityId').exists().withMessage('cityId required')
		.isUUID().withMessage('cityId should be of type string')
		.custom(async (cityId, { req }) => {
			const city = await City.findOne({ where : { id: cityId } });
			if(city == null) { throw new Error('Unknown city'); }
		}),
	query('watchId').exists().withMessage('watchId required')
		.isUUID().withMessage('watchId should be of type string')
		.custom(async (watchId, { req }) => {
			const watch = await Watches.findOne({ where : { id: watchId } });
			if(watch == null) { throw new Error('Unknown watch type'); }
		}),
	query('startDate').exists().withMessage('startDate required')
		.isInt({min: 0}).toInt().withMessage('startDate should be of type int')
		.custom((value, { req }) => { 
			const curDate = Date.now();
			console.log('custom validator1: ', value);
			if(new Date(value) == 'Invalid date') { throw new Error('Invalid timestamp'); }
			if(value < curDate) { throw new Error('Past date time is not allowed'); }
			
			// Indicates the success of this synchronous custom validator
			return true;
		}),
		
	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			
			let { cityId, watchId, startDate } = req.query;
			
			
			console.log('[route] GET /available_masters query params: ', cityId, watchId, startDate);
			const clientDateTime = moment.unix(startDate / 1000);
			const backendDateTime = moment.now();
			console.log('[route] GET /available_masters clientDateTime:', clientDateTime);
			console.log('[route] GET /available_masters backendDateTime:', backendDateTime);			
			
			//////////////////////////////////////////////////////
			startDate = dateToNearestHour(startDate);
			//////////////////////////////////////////////////////
			
			console.log('[route] GET /available_masters query params: ', cityId, watchId, startDate);
			
			const watch = await Watches.findOne({ where : { id: watchId } });
			
			console.log('[route] GET /available_masters watch type: ', watch.toJSON());
			const orderRepairTime = watch.repairTime;
			const orderStartDate = startDate;
			const orderEndDate = (startDate + orderRepairTime * 60 * 60 * 1000);
			
			console.log('[route] GET /available_masters startDate: ', orderStartDate, ', endDate: ', orderEndDate);
			console.log('[route] GET /available_masters startDate: ', moment.unix(orderStartDate).utc(), ', endDate: ', moment.unix(orderEndDate).utc());
			
			let bussyMasters = await Order.findAll({
				raw:true,
				attributes: ['masterId'],
				group: ['masterId'],
				where: {
					startDate: { [Op.lt]: orderEndDate },
					endDate: { [Op.gt]: orderStartDate },
				}
			});
			bussyMasters = bussyMasters.map(item => item.masterId);
			
			console.log('[route] GET /available_masters bussyMasters: ', bussyMasters);
			
			let masters = await Master.findAll({ 
				where: {
					id: {
						[Op.notIn]: bussyMasters,
					},					
					/*'$orders."startDate"$': { [Op.lt]: orderEndDate },
					'$orders."endDate"$': { [Op.gt]: orderStartDate },*/
				},
				include: [
					{ model: City, as: 'cities', through: {attributes: []}, where: {id: cityId} },
					{ 
						model: Order, as: 'orders', 
						include: [
							{ model: Watches, as: 'watch'},
							{ model: City, as: 'city'}
						],
						attributes: { exclude: ['clientId', 'watchId', 'cityId', 'masterId'] },
						order: [['updatedAt', 'DESC']],
					},
				],
				order: [['rating', 'DESC'], ['updatedAt', 'DESC']]				
			});
			
			console.log('[route] GET /available_masters result: ', masters);
			res.status(200).json({ masters }).end();
		} catch(e) { 
			console.log(e); 
			res.status(400).end(); 
		}
	}
];

const create = [
	body('order').exists().withMessage('order object required')
		.isObject().withMessage('order object required'),
	body('order.client').exists().withMessage('order.client object required')
		.isObject().withMessage('order.client object required'),
	body('order.client.name').exists().withMessage('order.client.name required')
		.isString().withMessage('Client name should be of type string')
		.trim().escape().isLength({min: 3}).withMessage('Empty client name is not allowed (min len=3)'),
	body('order.client.email').exists().withMessage('order.client.email required')
		.isString().withMessage('Client email should be of type string')
		.trim().escape().notEmpty().withMessage('Empty client email is not allowed')
		.isEmail().withMessage('Client email is not correct'),
	body('order.watchId').exists().withMessage('order.watchId required')
		.isUUID	().withMessage('watchId should be of type string')
		.custom(async (watchId, { req }) => {
			const watch = await Watches.findOne({ where : { id: watchId } });
			if(watch == null) { throw new Error('Unknown watch type'); }
		}),
	body('order.cityId').exists().withMessage('order.cityId required')
		.isUUID().withMessage('cityId should be of type string')
		.custom(async (cityId, { req }) => {
			const city = await City.findOne({ where : { id: cityId } });
			if(city == null) { throw new Error('Unknown city'); }
		}),
	body('order.masterId').exists().withMessage('order.masterId required')
		.isUUID().withMessage('masterId should be of type string')
		.custom(async (masterId, { req }) => {
			const master = await Master.findOne({ where : { id: masterId } });
			if(master == null) { throw new Error('Unknown master'); }
		}),
	body('order.startDate').exists().withMessage('order.startDate required')
		.isInt({min: 0}).toInt().withMessage('order.startDate should be of type int')
		.custom((value, { req }) => { 
			const curDate = Date.now();
			console.log('custom validator1: ', value);
			if(new Date(value) == 'Invalid date') { throw new Error('Invalid timestamp'); }
			if(value < curDate) { throw new Error('Past date time is not allowed'); }
			
			// Indicates the success of this synchronous custom validator
			return true;
		}),
	body('order.timezone').exists().withMessage('order.timezone required')
		.isInt().toInt().withMessage('order.timezone should be of type int'),
	
	async (req, res) => {
		
		let transaction = null;
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			}
	
			let { order } = req.body;
			console.log('[route] POST /orders ', order);
			
			const watch = await Watches.findOne({ where: { id: order.watchId } });
			const city = await City.findOne({ where: { id: order.cityId } });
			const master = await Master.findOne({ 
				where: { id: order.masterId }, 
				include: [
					{ model: City, as: 'cities', through: {attributes: []} }, 
				],
			});
			
			console.log('[route] POST /orders watch obj: ', watch.toJSON());
			console.log('[route] POST /orders city obj: ', master.toJSON());
			console.log('[route] POST /orders master obj: ', city.toJSON());
			
			// Ensure master can handle order for specified cityId
			if(master.cities.find(city => city.id == order.cityId) == null) {
				return res.status(409).json({ detail: 'Master cant handle this order at specified city'});
			}
			
			//////////////////////////////////////////////////////
			order.startDate = dateToNearestHour(order.startDate);
			//////////////////////////////////////////////////////
			order.client.name = order.client.name.trim();
			order.client.email = order.client.email.trim();
			
			const orderRepairTime = watch.repairTime;
			const orderStartDate = order.startDate;
			const orderEndDate = (order.startDate + orderRepairTime * 60 * 60 * 1000);
			order.endDate = orderEndDate;
			//////////////////////
			//////////////////////
	
			const clientDateTime = moment.unix((order.startDate + 60 * 60 * 1000 * order.timezone) / 1000);
			const backendDateTime = moment.now();
			
			console.log('[route] POST /orders clientDateTime: ', clientDateTime);
			console.log('[route] POST /orders backendDateTime: ', backendDateTime);
			console.log('[route] POST /orders prepared order data: ', order);
			
			/////////////////////////////////////////////////////////////
			transaction = await db.sequelize.transaction();
			
			let client = await Client.findOne({ where: { email: order.client.email } });
			if(client == null) {
				client = await Client.create(order.client);
			} else {
				await Client.update({ name: order.client.name }, { where: { email: order.client.email } });
			}
			order.clientId = client.id;			
			console.log('[route] POST /orders createOrUpdateClient result: ', client);
			
			let result = await Order.create(order);
			console.log('[route] POST /orders createOrder result: ', result);
			
			await transaction.commit();
			/////////////////////////////////////////////////////////////
			
			const params = {
				from: `${process.env.NODEMAILER_AUTH_GMAIL_USER}@gmail.com`,
				to: order.client.email,
				subject: 'Your order details at ClockwiseClockware',
				text: '',
				html: `
				<html>
				<head></head>
				<body>
					<p>Mr(s) ${order.client.name} thank you for trusting us to do the repair work !</p><br/>
					<p>Order details:</p>
					<p>Order ID=${result.id}</p>
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
								<td><b>${master.name}</b>, <i>${master.email}</i></td>
								<td>${city.name}</td>
								<td>${watch.name}</td>						
								<td>${clientDateTime}</td>
								<td>${clientDateTime}</td>
							</tr>
						</tbody>
					</table>
				</body>
				</html>`, // html body
			};
			console.log(params);
			
			//let info = await sendMail(params);
			// DUMMY DUE TESTS
			const info = {messageId: params};
			console.log(info);
			res.status(201).json({ info }).end();
			//res.status(201).json({ info: JSON.stringify(info) }).end();
			
		} catch(e) { 
			console.log(e); 
			console.log(e.constraint);
			if(transaction) { transaction.rollback(); }
			
			
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
// +
const getAll = [
	RouteProtector, 
	async (req, res) => {
		try {
			console.log('[route] GET /orders');
			
			let orders = await Order.findAll({
				include: [
					{ model: Client, as: 'client' }, 
					{ model: Watches, as: 'watch' }, 
					{ model: City, as: 'city' }, 
					{ model: Master, as: 'master' }
				],
				attributes: { exclude: ['clientId', 'watchId', 'cityId', 'masterId'] },
				order: [['masterId'], ['startDate', 'DESC'], ['updatedAt', 'DESC']] 
			});
			
			console.log('[route] GET /orders result: ', orders);
			res.status(200).json({ orders }).end();
		} catch(e) { console.log(e); res.status(400).json(e).end(); }
	}
];

// +
const remove = [
	RouteProtector, 
	param('id').exists().withMessage('Order ID required')
		.isUUID().withMessage('Order ID should be of type string'),
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
			
			let result = await Order.destroy({ where: { id: id } });
			console.log('[route] DELETE /orders/:id result: ', result);
			if(result == 0) {
				return res.status(404).json({ detail: '~Order not found~' }).end();
			}
			res.status(204).end();
		} catch(e) { 
			console.log(e); 
			// Incorrect UUID ID string
			if(e && e.name && e.name == 'SequelizeDatabaseError' 
				&& e.parent && e.parent.routine && e.parent.routine == 'string_to_uuid') {
				return res.status(404).json({ detail: 'Order not found' }).end();
			}
			res.status(400).json(e).end(); 
		}
	}
];

// +
const get = [
	RouteProtector, 
	param('id').exists().withMessage('Order ID required')
		.isString().withMessage('Order ID should be of type string'),
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
			
			let order = await Order.findOne({
				where: { id: id },
				include: [
					{ model: Client, as: 'client' }, 
					{ model: Watches, as: 'watch' }, 
					{ model: City, as: 'city' }, 
					{ model: Master, as: 'master' }
				],
				attributes: { exclude: ['clientId', 'watchId', 'cityId', 'masterId'] },
			});
			console.log('[route] GET /orders/:id result: ', order.toJSON());
			if(!order) {
				return res.status(404).json({detail: '~Order not found~'}).end();
			}
			
			const curDate = Date.now();
			console.log('curDate backend: ', curDate);
			console.log('curDate client: ', new Date(order.startDate).getTime());
			if(new Date(order.startDate).getTime() < curDate) { 
				return res.status(403).json({ detail: 'Unable to get order with datetime that is already past'}).end();
			}
			res.status(200).json({ order }).end();
		} catch(e) { 
			console.log(e); 
			// Incorrect UUID ID string
			if(e && e.name && e.name == 'SequelizeDatabaseError' 
				&& e.parent && e.parent.routine && e.parent.routine == 'string_to_uuid') {
				return res.status(404).json({ detail: 'Order not found' }).end();
			}
			res.status(400).end(); 
		}
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
		.isInt({min: 0}).toInt().withMessage('order.startDate should be of type int')
		.custom((value, { req }) => { 
			const curDate = Date.now();
			if(new Date(value) == 'Invalid date') { throw new Error('Invalid timestamp'); }
			if(value < curDate) { throw new Error('Past date time is not allowed'); }
			
			// Indicates the success of this synchronous custom validator
			return true;
		}),

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
			const nearestDate = dateToNearestHour(order.startDate) / 1000;
			console.log('[route] PUT /orders NEAREST DATE: ', nearestDate);
			order.client.name = order.client.name.trim();
			order.client.email = order.client.email.trim();
			order.startDate = nearestDate;
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
	getFreeMasters, create, getAll, remove, get, update
};