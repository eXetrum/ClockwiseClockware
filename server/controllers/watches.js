const { Watches } = require('../database/models');

// Client part (No route protection)
const get = async (req, res) => {
	try {
		console.log('[route] GET /watches');
		const watches = await Watches.findAll();
		console.log('[route] GET /watches result: ', watches);
		res.status(200).json({ watches }).end();
	} catch(e) { console.log(e); res.status(400).end();}
};

module.exports = {
	get
};