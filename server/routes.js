require('dotenv').config();
const router = require('express').Router();
const jwt = require("jsonwebtoken");
const { getItems, getCities, getUser } = require('./db');


router.post('/api/register', (req, res) => {
	// TODO
	req.end();
});

const RouteProtector = async (req, res, next) => {
	console.log('Route protector: ', req.headers.authorization);
	if(!req.headers.authorization) {
		console.log('Route protector: NO AUTH HEADER');
		res.status(403).end();
		return;
	}
	
	try {
		const token = req.headers.authorization.split(" ")[1];  
		jwt.verify(token, process.env.JWT_TOKEN_SECRET);
	} catch(e) {
		console.log('Route protector: token', e);
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
	} catch(e) { console.log(e); }
});


////////////////////////////
router.get('/api/items', RouteProtector, async (req, res) => {
	try {
		let items = await getItems();
		console.log('items: ', items);
		res.status(200).json({
			items
		});
	} catch(e) { console.log(e); }
});

////////////////////////////
router.get('/api/cities', RouteProtector, async (req, res) => {
	try {
		let cities = await getCities();
		console.log('cities: ', cities);
		res.status(200).json({
			cities
		});
	} catch(e) { console.log(e); }
});


module.exports = router;