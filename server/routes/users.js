const router = require('express').Router();
const { generateAccessToken } = require('../middleware/RouteProtector');
const { getUser } = require('../models/users');

router.post('/api/register', (req, res) => {
	// TODO: if any
	req.end();
});

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

module.exports = router;