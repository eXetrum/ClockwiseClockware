const router = require('express').Router();
const { RouteProtector } = require('../middleware/RouteProtector');
const { BodyParamsValidator, RouteParamsValidator } = require('../middleware/ParamsValidator');
const { body, validationResult } = require('express-validator');
const { getMasters, createMaster, deleteMasterById, getMasterById, updateMasterById } = require('../models/masters');

router.get('/api/masters', RouteProtector, async (req, res) => {
	try {
		console.log('[route] GET /masters');
		let masters = await getMasters();
		console.log('[route] GET /masters result: ', masters);
		res.status(200).json({ masters }).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.post('/api/masters', 
	RouteProtector, 
	body('master').notEmpty().withMessage('Master object required'),
	body('master.name').exists().withMessage('Master name required')
		.isString().withMessage('Master name should be of type string')
		.trim().escape().notEmpty().withMessage('Empty master name is not allowed'),
	body('master.email').exists().withMessage('Master email required')
		.isString().withMessage('Master email should be of type string')
		.trim().escape().notEmpty().withMessage('Empty master email is not allowed')
		.isEmail().withMessage('Master email is not correct'),
	body('master.rating').exists().withMessage('Master rating required')
		.isNumeric().withMessage('Master rating should be of numeric value')
		.isInt({ min: 0, max: 5 }).withMessage('Master rating must be in range [0; 5]'),
	body('master.cities').exists().withMessage('Master cities required')
		.isArray().withMessage('Master cities should be an array'),
	body('master.cities.*.id').exists().withMessage('Each object of cities array should contains id field')
		.isNumeric().withMessage('Master cities array should contains "city" entries with id field of numeric type')
		.isInt({min: 0 }).withMessage('Master cities array should contains "city" entries with positive numeric id field'),
		
	async (req, res) => {
		try {
			const errors = validationResult(req).array();
			console.log('ERRORS: ', errors);
			if (errors && errors.length) {
				// Send first error back to the client
				return res.status(400).json({ detail: errors[0].msg }).end();
			} 
			
			const { master } = req.body;
			console.log('[route] POST /masters ', master);
			let masters = await createMaster(master);
			console.log('[route] POST /masters result: ', master);
			res.status(201).json({master}).end();
		} catch(e) { 
			console.log(e); 
			if(e.constraint == 'masters_email_key') {
				return res.status(409).json({ detail: `Master with specified email already exists`}).end();
			}
			res.status(400).json(e).end(); 
		}
	}
);

router.delete('/api/masters/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('[route] DELETE /masters ', id);
		let result = await deleteMasterById(id);
		console.log('[route] DELETE /masters result: ', result);
		if(Array.isArray(result) && result.length == 0) {
			return res.status(404).json({ detail: 'City not found' }).end();
		}
		res.status(204).end();
	} catch(e) { 
		console.log(e); 
		console.log(e.constraint);
		if(e.constraint == 'master_city_list_master_id_fkey') {
			return res.status(409).json({ detail: `Deletion restricted. Master contains reference(s) to city/cities`}).end();
		} else if(e.constraint == 'orders_master_id_fkey') {
			return res.status(409).json({ detail: `Deletion restricted. At least one order contains reference to this master`}).end();
		}
		res.status(400).end(); 
	}
});

router.get('/api/masters/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('[route] GET /masters/:id ', id);
		let result = await getMasterById(id);
		console.log('[route] GET /masters/:id result: ', result);
		let master = result[0];
		console.log('[route] GET /masters/:id result: ', master);
		if(!master) {
			res.status(404).json({message: 'Record Not Found'}).end();
		} else {
			res.status(200).json({ master }).end();
		}
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.put('/api/masters/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		let { master } = req.body;
		console.log('[route] PUT /masters/:id ', id, master);
		let result = await updateMasterById(id, master);
		console.log('[route] PUT /masters/:id result: ', result);
		result = await getMasterById(id);
		master = result[0]; 
		console.log('[route] PUT /masters/:id result: ', master);
		if(!master) {
			res.status(404).json({message: 'Record Not Found'}).end();
		} else {
			res.status(200).json({ master }).end();
		}
	} catch(e) { console.log(e); res.status(400).json(e).end(); }
});

module.exports = router;