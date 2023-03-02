const { RouteProtector } = require('../middleware/RouteProtector');
const { body, param, validationResult } = require('express-validator');
const { City } = require('../database/models');

const getAll = async (req, res) => {
	try {
		let cities = await City.findAll({ order: [['updatedAt', 'DESC']] });
		res.status(200).json({ cities }).end();
	} catch(e) { console.log(e); res.status(400).end(); }
};

const create = [
	RouteProtector, 
	body('cityName').exists().withMessage('cityName required')
		.isString().withMessage('cityName should be of type string')
		.trim().escape().notEmpty().withMessage('Empty cityName is not allowed'), 
	async (req, res) => {		
		try {
			const errors = validationResult(req).array();
			if (errors && errors.length) {
				console.log('Validation ERRORS: ', errors);
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			
			let { cityName } = req.body;
			cityName = cityName.trim();
			
			const city = await City.create({ name: cityName });
			res.status(201).json({ city }).end();
		} catch(e) { 
			console.log(e);
			if(e.name == 'SequelizeUniqueConstraintError') 
				return res.status(409).json({ detail: 'City already exists'}).end();
			
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
			if (errors && errors.length) {
				console.log('Validation ERRORS: ', errors);
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			
			const { id } = req.params;
			const result = await City.destroy({ where: {id: id} });
			if(!result) 
				return res.status(404).json({ detail: 'City not found' }).end();
			res.status(204).end();
			
		} catch(e) { 
			console.log(e);
			// Incorrect UUID ID string
			if(e.name == 'SequelizeDatabaseError' && e.parent && e.parent.routine == 'string_to_uuid')
				return res.status(404).json({ detail: 'City not found' }).end();
			
			if(e.name == 'SequelizeForeignKeyConstraintError' && e.parent) {
				if(e.parent.constraint == 'master_city_list_cityId_fkey') 
					return res.status(409).json({ detail: 'Deletion restricted. Master(s) reference(s)'}).end();
					
				if(e.parent.constraint == 'orders_cityId_fkey')
					return res.status(409).json({ detail: 'Deletion restricted. Order(s) reference(s)'}).end();
			}
			
			res.status(400).end(); 
		}
	}
];

const get = [
	RouteProtector, 
	param('id').exists().notEmpty().withMessage('City ID required'),
	async (req, res) => {
		
		try {
			const errors = validationResult(req).array();
			if (errors && errors.length) {
				console.log('Validation ERRORS: ', errors);
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			
			const { id } = req.params;
			const city = await City.findOne({ where: { id: id }});
			if(!city)
				return res.status(404).json({ detail: 'City not found' }).end();
			
			res.status(200).json({ city }).end();
		} catch(e) { 
			console.log(e); 
			
			// Incorrect UUID ID string
			if(e.name == 'SequelizeDatabaseError' && e.parent && e.parent.routine == 'string_to_uuid')
				return res.status(404).json({ detail: 'City not found' }).end();
			
			res.status(400).end(); 
		}
	}
];

const update = [
	RouteProtector, 
	param('id').exists().notEmpty().withMessage('City ID required'),
	body('cityName').exists().withMessage('cityName required')
		.isString().withMessage('cityName should be of type string')
		.trim().escape().notEmpty().withMessage('Empty cityName is not allowed'),
	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			if (errors && errors.length) {
				console.log('Validation ERRORS: ', errors);
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			const { id } = req.params;
			let { cityName } = req.body;
			cityName = cityName.trim();
			
			const [affectedRows, result] = await City.update({ name: cityName }, { where: { id: id }, returning: true });
			if(affectedRows == 0)
				return res.status(404).json({ detail: 'City not found' }).end();
				
			res.status(204).end();
		} catch(e) { 
			console.log(e); 
			
			// Incorrect UUID ID string
			if(e.name == 'SequelizeDatabaseError' && e.parent && e.parent.routine == 'string_to_uuid')
				return res.status(404).json({ detail: 'City not found' }).end();
			
			// City already exists
			if(e.name == 'SequelizeUniqueConstraintError')
				return res.status(409).json({ detail: 'City already exists'}).end();
			
			res.status(400).end(); 
		}
	}
];

module.exports = {
	getAll, create, remove, get, update
};