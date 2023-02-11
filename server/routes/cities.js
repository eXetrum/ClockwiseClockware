const router = require('express').Router();
const { RouteProtector } = require('../middleware/RouteProtector');
const { BodyParamsValidator, RouteParamsValidator } = require('../middleware/ParamsValidator');
const { getCities, createCity, deleteCityById, getCityById, updateCityById } = require('../models/cities');

// No route protector
router.get('/api/cities', async (req, res) => {
	try {
		console.log('[route] GET /cities');
		let cities = await getCities();
		console.log('[route] GET /cities result: ', cities);
		res.status(200).json({
			cities
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.post('/api/cities', 
	RouteProtector, 
	BodyParamsValidator([
		{
			param_key: 'cityName',
			required: true,
			type: 'string',
			validator_functions: [(param) => {return param.trim().length > 0}]
		}
	]), 
	async (req, res) => {
		
	try {
		let { cityName } = req.body;
		cityName = cityName.trim();
		if(cityName == '' || cityName.length == 0) {
			res.status(400).json({ detail: 'Empty city name is not allowed'}).end();
			return;
		}
		console.log('[route] POST /cities: ', cityName);
		let result = await createCity(cityName);
		let city = result[0];
		console.log('[route] POST /cities: ', city);
		res.status(201).json({ city }).end();
	} catch(e) { 
		console.log(e);
		if(e.constraint == 'cities_name_key') {
			res.status(409).json({ detail: `City already exists`}).end();
			return;
		}
		res.status(400).json(e).end(); 
	}
});

router.delete('/api/cities/:id', 
	RouteProtector, 
	RouteParamsValidator([
		{
			param_key: 'id',
			required: true,
			type: 'string',
			validator_functions: [(param) => {return param != null && !isNaN(param)}]
		}
	]),
	async (req, res) => {
		
	try {
		const { id } = req.params;
		if(id == null || id == undefined) {
			return res.status(400).json({ detail: 'City id required' }).end();
		}
		console.log('[route] DELETE /cities/:id ', id);
		let result = await deleteCityById(id);
		if(Array.isArray(result) && result.length == 0) {
			return res.status(404).json({ detail: 'City not found' }).end();
		}
		console.log('[route] DELETE /cities del result: ', result);
		res.status(204).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.get('/api/cities/:id', 
	RouteProtector, 
	RouteParamsValidator({
		param_key: 'id',
		required: true,
		type: 'string',
		validator_functions: [(param) => {return param != null && !isNaN(param)}]
	}),
	async (req, res) => {
		
	try {
		const { id } = req.params;
		console.log('[route] GET /cities/:id ', id);
		let result = await getCityById(id);
		console.log('[route] GET /cities/:id result: ', result);
		let city = result[0];
		console.log('[route] GET /cities/:id result: ', city);
		if(!city) {
			res.status(404).json({message: 'Record Not Found'}).end();
		} else {
			res.status(200).json({ city }).end();
		}
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.put('/api/cities/:id', 
	RouteProtector, 
	RouteParamsValidator({
		param_key: 'id',
		required: true,
		type: 'string',
		validator_functions: [(param) => {return param != null && !isNaN(param)}]
	}),
	BodyParamsValidator({
		param_key: 'cityName',
		required: true,
		type: 'string',
		validator_functions: [(param) => {return param.trim().length > 0}]
	}),
	async (req, res) => {
		
	try {
		const { id } = req.params;
		const { cityName } = req.body;
		console.log('[route] PUT /cities/:id ', id, cityName);
		let result = await updateCityById(id, cityName);
		console.log('[route] PUT /cities/:id result: ', result);
		result = await getCityById(id);
		let city = result[0];
		console.log('[route] PUT /cities/:id result: ', city);
		if(!city) {
			res.status(404).json({message: 'Record Not Found'}).end();
		} else {
			res.status(200).json({city}).end();
		}
	} catch(e) { console.log(e); res.status(400).end(); }
});

module.exports = router;