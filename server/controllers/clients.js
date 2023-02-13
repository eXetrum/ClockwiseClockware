const { RouteProtector } = require('../middleware/RouteProtector');
const { body, param, validationResult } = require('express-validator');
const { getClients, deleteClientById, getClientById, updateClientById } = require('../models/clients');

const getAll = async (req, res) => {
	try {
		console.log('[route] GET /clients');
		let clients = await getClients();
		console.log('[route] GET /clients result: ', clients);
		res.status(200).json({ clients }).end();
	} catch(e) { console.log(e); res.status(400).end(); }
};

const remove = [
	RouteProtector, 
	param('id').exists().notEmpty().isInt().toInt().withMessage('Client ID must be integer value'),
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
			let result = await deleteClientById(id);
			console.log('[route] DELETE /clients/:id result: ', result);
			if(Array.isArray(result) && result.length == 0) {
				return res.status(404).json({ detail: 'Client not found' }).end();
			}
			res.status(204).end();
		} catch(e) { 
			console.log(e); 
			console.log(e.constraint);
			if(e.constraint == 'orders_client_id_fkey') {
				return res.status(409).json({ detail: `Deletion restricted. At least one order contains reference to this client`}).end();
			}
			res.status(400).end();
		}
	}
];

const get = [
	RouteProtector, 
	param('id').exists().notEmpty().isInt().toInt().withMessage('Client ID must be integer value'),
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
			let result = await getClientById(id);
			console.log('[route] GET /clients/:id result: ', result);
			let client = result[0];
			if(!client) {
				res.status(404).json({detail: 'Client not found'}).end();
			} else {
				res.status(200).json({ client }).end();
			}
		} catch(e) { console.log(e); res.status(400).end(); }
	}
];

const update = [
	RouteProtector, 
	param('id').exists().notEmpty().isInt().toInt().withMessage('Client ID must be integer value'),
	body('client').notEmpty().withMessage('Client object required'),
	body('client.name').exists().withMessage('Client name required')
		.isString().withMessage('Client name should be of type string')
		.trim().escape().notEmpty().withMessage('Empty client name is not allowed')
		.isLength({ min: 3 }).withMessage('Client name must be at least 3 character long'),
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
			console.log('[route] PUT /clients/:id ', id, client);
			let result = await updateClientById(id, client);
			console.log('[route] PUT /clients/:id result: ', result);
			client = result[0];			
			if(!client) {
				res.status(404).json({detail: 'Client not found'}).end();
			} else {
				res.status(200).json({ client }).end();
			}
		} catch(e) { 
			console.log(e); 
			console.log('constraint: ', e.constraint);
			if(e.constraint == 'clients_email_key') {
				return res.status(409).json({ detail: `Client with specified email already exists`}).end();
			}
			res.status(400).json(e).end(); 
		}
	}
];

module.exports = {
	getAll, remove, get, update
};