require('dotenv').config();
const router = require('express').Router();
const jwt = require("jsonwebtoken");

const { doLogin, getUser } = require('./db');

router.post('/api/register', (req, res) => {
	// TODO
	req.end();
});

function generateAccessToken(user) {
	return jwt.sign(user, process.env.JWT_TOKEN_SECRET, { expiresIn: '1800s' });
}

router.post('/api/login', async (req, res) => {
	try {
		// Get user input
		const { email, password } = req.body;
		console.log('login', email, password);
		let user = await getUser(email, password);
		console.log(user);
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

module.exports = router;