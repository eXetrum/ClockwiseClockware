require('dotenv').config();
const router = require('express').Router();
const jwt = require("jsonwebtoken");
const { 
	getUser, getWatchTypes, 
	getCities, createCity, deleteCityById, getCityById, updateCityById,
	getMasters, createMaster, deleteMasterById, getMasterById, updateMasterById
} = require('./db');


router.post('/api/register', (req, res) => {
	// TODO
	req.end();
});

const RouteProtector = async (req, res, next) => {
	//console.log('Route protector: ', req.headers.authorization);
	if(!req.headers.authorization) {
		//console.log('Route protector: NO AUTH HEADER');
		res.status(403).end();
		return;
	}
	
	try {
		const token = req.headers.authorization.split(" ")[1];  
		jwt.verify(token, process.env.JWT_TOKEN_SECRET);
	} catch(e) {
		//console.log('Route protector: token', e);
		res.status(403).end();
		return;
	}
	
	next();
};

const generateAccessToken = (user) => {
	return jwt.sign(user, process.env.JWT_TOKEN_SECRET, { expiresIn: '24h' });
};

router.post('/api/login', async (req, res) => {
	try {
		// Get user input
		const { email, password } = req.body;
		console.log('login', email, password);
		let user = await getUser(email, password);
		console.log('db user: ', user);
		if(!user) {
			console.log('User/Password pair not found');
			res.status(401).end();
			return;
		}
		
		token = generateAccessToken(user);
		res.status(200).json({
			accessToken: token
		});
	} catch(e) { console.log(e); res.status(400).end(); }
});


////////////////////////////
router.get('/api/watch_types', RouteProtector, async (req, res) => {
	try {
		let watchTypes = await getWatchTypes();
		console.log('watchTypes: ', watchTypes);
		res.status(200).json({
			watchTypes
		}).end();
	} catch(e) { console.log(e); res.status(400).end();}
});

////////////////////////////
router.get('/api/cities', RouteProtector, async (req, res) => {
	try {
		let cities = await getCities();
		console.log('cities: ', cities);
		res.status(200).json({
			cities
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.post('/api/cities', RouteProtector, async (req, res) => {
	try {
		const { cityName } = req.body;
		console.log('Create City: ', cityName);
		let cities = await createCity(cityName);
		console.log('cities: ', cities);
		res.status(200).json({
			cities
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.delete('/api/cities/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('Delete City: ', id);
		let result = await deleteCityById(id);
		console.log('delete result:', result);
		const cities = await getCities();
		console.log('cities: ', cities);
		res.status(200).json({
			cities
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.get('/api/cities/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('get city: ', id);
		let result = await getCityById(id);
		console.log('result: ', result);
		let city = result[0];
		console.log('citiy: ', city);
		res.status(200).json({
			city
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.put('/api/cities/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		const { cityName } = req.body;
		console.log('update city: ', id, cityName);
		let result = await updateCityById(id, cityName);
		console.log('result: ', result);
		result = await getCityById(id);
		let city = result[0];
		console.log('update: ', city);
		res.status(200).json({
			city
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

///////////////////////////////////
router.get('/api/masters', RouteProtector, async (req, res) => {
	try {
		let masters = await getMasters();
		console.log('masters: ', masters);
		res.status(200).json({
			masters
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.post('/api/masters', RouteProtector, async (req, res) => {
	try {
		const { master } = req.body;
		console.log('create master route: ', master);
		let masters = await createMaster(master);
		console.log('masters: ', masters);
		res.status(200).json({
			masters
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.delete('/api/masters/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('Delete master: ', id);
		let result = await deleteMasterById(id);
		console.log('delete result:', result);
		const masters = await getMasters();
		console.log('masters: ', masters);
		res.status(200).json({
			masters
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.get('/api/masters/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('get master: ', id);
		let result = await getMasterById(id);
		console.log('result: ', result);
		let master = result[0];
		console.log('citiy: ', master);
		res.status(200).json({
			master
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.put('/api/masters/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		let { master } = req.body;
		console.log('update master: ', id, master);
		let result = await updateMasterById(id, master);
		console.log('result: ', result);
		result = await getMasterById(id);
		master = result[0]; 
		console.log('update: ', master);
		res.status(200).json({
			master
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

module.exports = router;