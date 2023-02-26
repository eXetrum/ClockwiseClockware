const { RouteProtector } = require('../middleware/RouteProtector');
const { body, param, validationResult } = require('express-validator');
const { Client } = require('../database/models');

// +
const getAll = async (req, res) => {
	try {
		console.log('[route] GET /clients');
		let clients = await Client.findAll({ order: [['updatedAt', 'DESC']] });
		console.log('[route] GET /clients result: ', clients);
		res.status(200).json({ clients }).end();
	} catch(e) { console.log(e); res.status(400).end(); }
};

const remove = [
	RouteProtector, 
	param('id').exists().notEmpty().withMessage('Client ID required'),
	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			
			const { id } = req.params;
			console.log('[route] DELETE /clients/:id ', id);
			let result = await Client.destroy({ where: { id: id } });			
			console.log('[route] DELETE /masters result: ', result);
			if(result == 0) {
				return res.status(404).json({ detail: '~Client not found~' }).end();
			}
			res.status(204).end();
		} catch(e) { 
			console.log(e); 
			
			// Incorrect UUID ID string
			if(e && e.name && e.name == 'SequelizeDatabaseError' 
				&& e.parent && e.parent.routine && e.parent.routine == 'string_to_uuid') {
				return res.status(404).json({ detail: 'Client not found' }).end();
			}
			
			// TODO: "not implemented"
			if(e && e.name && e.name == 'SequelizeForeignKeyConstraintError' && e.parent && e.parent.constraint) {
				if(e.parent.constraint == 'orders_client_id_fkey') { 
					return res.status(409).json({ detail: 'Deletion restricted. At least one order contains reference to this client'}).end();
				}
			}
			
			res.status(400).end();
		}
	}
];

// +
const get = [
	RouteProtector, 
	param('id').exists().notEmpty().withMessage('Client ID required'),
	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			}
			
			const { id } = req.params;		
			console.log('[route] GET /clients/:id ', id);			
			const client = await Client.findOne({ where: { id: id } });
			
			console.log('[route] GET /client/:id result: ', client);
			if(!client) {
				return res.status(404).json({detail: '~Client not found~'}).end();
			}
			res.status(200).json({ client }).end();
		} catch(e) { 
			console.log(e); 
			// Incorrect UUID ID string
			if(e && e.name && e.name == 'SequelizeDatabaseError' 
				&& e.parent && e.parent.routine && e.parent.routine == 'string_to_uuid') {
				return res.status(404).json({ detail: 'Client not found' }).end();
			}
			res.status(400).end(); 
		}
	}
];

// +
const update = [
	RouteProtector, 
	param('id').exists().notEmpty().withMessage('Client ID required'),
	body('client').notEmpty().withMessage('Client object required'),
	body('client.name').exists().withMessage('Client name required')
		.isString().withMessage('Client name should be of type string')
		.trim().escape().notEmpty().withMessage('Empty client name is not allowed')
		.isLength({ min: 3 }).withMessage('Client name must be at least 3 characters long'),
	body('client.email').exists().withMessage('Client email required')
		.isString().withMessage('Client email should be of type string')
		.trim().escape().notEmpty().withMessage('Empty client email is not allowed')
		.isEmail().withMessage('Client email is not correct'),
	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			}
			
			const { id } = req.params;
			let { client } = req.body;
			console.log('[route] PUT /clients/:id before preprocessing: ', id, client);
			
			// Prepare data
			client.name = client.name.trim();
			client.email = client.email.trim();
			
			console.log('[route] PUT /clients/:id after preprocessing: ', client);
			
			//
			let [affectedRows, result] = await Client.update(client, { where: { id: id }, returning: true, limit: 1 });
			
			console.log('[route] PUT /clients/:id result: ', affectedRows, result);
			
			if(!affectedRows) {
				return res.status(404).json({detail: '~Client not found~'}).end();
			}
			
			res.status(204).end();
		} catch(e) { 
			console.log(e); 
			
			// Incorrect UUID ID string
			if(e && e.name && e.name == 'SequelizeDatabaseError' 
				&& e.parent && e.parent.routine && e.parent.routine == 'string_to_uuid') {
				return res.status(404).json({ detail: 'Client not found' }).end();
			}
			
			if(e && e.name == 'SequelizeUniqueConstraintError') {
				return res.status(409).json({ detail: 'Client with specified email already exists'}).end();
			}

			res.status(400).json(e).end(); 
		}
	}
];

module.exports = {
	getAll, remove, get, update
};