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
		res.status(200).json({ cities }).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.post('/api/cities', 
	RouteProtector, 
	BodyParamsValidator([
		{
			param_key: 'cityName',
			required: true,
			type: 'string',
			validator_functions: [{ func: (param) => {return param.trim().length > 0}, errorText: 'Empty city name is not allowed' }]
		}
	]), 
	async (req, res) => {
		
	try {
		let { cityName } = req.body;
		cityName = cityName.trim();
		console.log('[route] POST /cities: ', cityName);
		let result = await createCity(cityName);
		let city = result[0];
		console.log('[route] POST /cities: ', city);
		res.status(201).json({ city }).end();
	} catch(e) { 
		console.log(e);
		if(e.constraint == 'cities_name_key') {
			return res.status(409).json({ detail: `City already exists`}).end();
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
			validator_functions: [{func: (param) => {return param != null && !isNaN(param) && parseInt(param) >= 0 }, errorText: 'ID must be integer value' }]
		}
	]),
	async (req, res) => {
		
	try {
		const { id } = req.params;
		console.log('[route] DELETE /cities/:id ', id);
		let result = await deleteCityById(id);
		console.log('[route] DELETE /cities del result: ', result);
		if(Array.isArray(result) && result.length == 0) {
			return res.status(404).json({ detail: 'City not found' }).end();
		}
		res.status(204).end();
	} catch(e) { 
		console.log(e); 
		console.log('constraint: ', e.constraint);
		if(e.constraint == 'master_city_list_city_id_fkey') {
			return res.status(409).json({ detail: `Deletion restricted. At least one master contains reference to this city`}).end();
		} else if(e.constraint == 'orders_city_id_fkey') {
			return res.status(409).json({ detail: `Deletion restricted. At least one order contains reference to this city`}).end();
		}
		res.status(400).end(); 
	}
});

router.get('/api/cities/:id', 
	RouteProtector, 
	RouteParamsValidator([
		{
			param_key: 'id',
			required: true,
			type: 'string',
			validator_functions: [{func: (param) => {return param != null && !isNaN(param) && parseInt(param) >= 0}, errorText: 'ID must be integer value'}]
		}
	]),
	async (req, res) => {
		
	try {
		const { id } = req.params;
		console.log('[route] GET /cities/:id ', id);
		let result = await getCityById(id);
		console.log('[route] GET /cities/:id result: ', result);
		if(Array.isArray(result) && result.length == 0) {
			return res.status(404).json({ detail: 'City not found' }).end();
		}
		let city = result[0];
		res.status(200).json({ city }).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.put('/api/cities/:id', 
	RouteProtector, 
	RouteParamsValidator([
		{
			param_key: 'id',
			required: true,
			type: 'string',
			validator_functions: [{func: (param) => {return param != null && !isNaN(param) && parseInt(param) >= 0}, errorText: 'ID must be integer value'}]
		}
	]),
	BodyParamsValidator([
		{
			param_key: 'cityName',
			required: true,
			type: 'string',
			validator_functions: [{ func: (param) => {return param.trim().length > 0}, errorText: 'Empty city name is not allowed' }]
		}
	]),
	async (req, res) => {
		
	try {
		const { id } = req.params;
		const { cityName } = req.body;
		console.log('[route] PUT /cities/:id ', id, cityName);
		let result = await updateCityById(id, cityName);
		console.log('[route] PUT /cities/:id result: ', result);
		if(Array.isArray(result) && result.length == 0) {
			return res.status(404).json({ detail: 'City not found' }).end();
		}
		res.status(200).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

module.exports = router;