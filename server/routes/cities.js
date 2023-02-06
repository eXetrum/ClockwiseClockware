const router = require('express').Router();
const { RouteProtector } = require('../middleware/RouteProtector');
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

router.post('/api/cities', RouteProtector, async (req, res) => {
	try {
		const { cityName } = req.body;
		console.log('[route] POST /cities: ', cityName);
		let result = await createCity(cityName);
		console.log('[route] POST /cities: ', result);
		const cities = await getCities();
		console.log('[route] POST /cities result: ', cities);
		res.status(200).json({
			cities
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.delete('/api/cities/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('[route] DELETE /cities/:id ', id);
		let result = await deleteCityById(id);
		console.log('[route] DELETE /cities del result: ', result);
		const cities = await getCities();
		console.log('[route] DELETE /cities result cities array: ', cities);
		res.status(200).json({
			cities
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.get('/api/cities/:id', RouteProtector, async (req, res) => {
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

router.put('/api/cities/:id', RouteProtector, async (req, res) => {
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