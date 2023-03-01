const { RouteProtector } = require('../middleware/RouteProtector');
const { body, param, validationResult } = require('express-validator');
const { City } = require('../database/models');

// No route protector
// +
const getAll = async (req, res) => {
	const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
	await delay(3000);
	//return res.status(404).end();
	try {
		console.log('[route] GET /cities');
		let cities = await City.findAll({ order: [['updatedAt', 'DESC']] });
		console.log('[route] GET /cities result: ', cities);
		res.status(200).json({ cities }).end();
	} catch(e) { console.log(e); res.status(400).end(); }
};

// +
const create = [
	RouteProtector, 
	body('cityName').exists().withMessage('cityName required')
		.isString().withMessage('cityName should be of type string')
		.trim().escape().notEmpty().withMessage('Empty cityName is not allowed'), 
	async (req, res) => {		
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			let { cityName } = req.body;
			cityName = cityName.trim();
			console.log('[route] POST /cities: ', cityName);
			const city = await City.create({ name: cityName });
			console.log('[route] POST /cities result: ', city);
			res.status(201).json({ city }).end();
		} catch(e) { 
			console.log(e);		
			if(e && e.name == 'SequelizeUniqueConstraintError') {
				return res.status(409).json({ detail: 'City already exists'}).end();
			}
			res.status(400).json(e).end(); 
		}
	}
];

const remove = [
	RouteProtector, 
	param('id').exists().notEmpty().withMessage('City ID required'),
	async (req, res) => {		
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			const { id } = req.params;
			console.log('[route] DELETE /cities/:id ', id);
			//let result = await deleteCityById(id);
			const result = await City.destroy({ where: { id: id }})
			console.log('[route] DELETE /cities del result: ', result);
			if(!result) {
				return res.status(404).json({ detail: 'City not found' }).end();
			}
			res.status(204).end();
		} catch(e) { 
			console.log(e);
			
			// Incorrect UUID ID string
			if(e && e.name && e.name == 'SequelizeDatabaseError' 
				&& e.parent && e.parent.routine && e.parent.routine == 'string_to_uuid') {
				return res.status(404).json({ detail: 'City not found' }).end();
			}
			
			if(e && e.name && e.name == 'SequelizeForeignKeyConstraintError' && e.parent && e.parent.constraint) {
				if(e.parent.constraint == 'master_city_list_cityId_fkey') {
					return res.status(409).json({ detail: 'Deletion restricted. At least one master contains reference to this city'}).end();
				} else if(e.parent.constraint == 'orders_cityId_fkey') {
					return res.status(409).json({ detail: 'Deletion restricted. At least one order contains reference to this city'}).end();
				}
			}
			res.status(400).end(); 
		}
	}
];

// +
const get = [
	RouteProtector, 
	param('id').exists().notEmpty().withMessage('City ID required'),
	async (req, res) => {
		
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			
			const { id } = req.params;
			console.log('[route] GET /cities/:id ', id);
			const city = await City.findOne({ where: { id: id }});
			console.log('[route] GET /cities/:id result: ', city);
			if(!city) {
				return res.status(404).json({ detail: 'City not found' }).end();
			}
			res.status(200).json({ city }).end();
		} catch(e) { 
			console.log(e); 
			
			// Incorrect UUID ID string
			if(e && e.name && e.name == 'SequelizeDatabaseError' 
				&& e.parent && e.parent.routine && e.parent.routine == 'string_to_uuid') {
				return res.status(404).json({ detail: 'City not found' }).end();
			}
			
			res.status(400).end(); 
		}
	}
];

// +
const update = [
	RouteProtector, 
	param('id').exists().notEmpty().withMessage('City ID required'),
	body('cityName').exists().withMessage('cityName required')
		.isString().withMessage('cityName should be of type string')
		.trim().escape().notEmpty().withMessage('Empty cityName is not allowed'),
	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			console.log('Validation ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			const { id } = req.params;
			let { cityName } = req.body;
			cityName = cityName.trim();
			
			console.log('[route] PUT /cities/:id ', id, cityName);
			const [affectedRows, result] = await City.update({ name: cityName }, { where: { id: id }, returning: true });
			console.log('[route] PUT /cities/:id result: ', affectedRows, result);
			if(affectedRows == 0 
				|| !result || Array.isArray(result) && result.length == 0) {
				return res.status(404).json({ detail: 'City not found' }).end();
			}
			res.status(204).end();
		} catch(e) { 
			console.log(e); 
			
			// Incorrect UUID ID string
			if(e && e.name && e.name == 'SequelizeDatabaseError' 
				&& e.parent && e.parent.routine && e.parent.routine == 'string_to_uuid') {				
				return res.status(404).json({ detail: 'City not found' }).end();
			}
			
			// City already exists
			if(e && e.name == 'SequelizeUniqueConstraintError') {
				return res.status(409).json({ detail: 'City already exists'}).end();
			}
			
			res.status(400).end(); 
		}
	}
];

module.exports = {
	getAll, create, remove, get, update
};