const router = require('express').Router();
const { RouteProtector } = require('../middleware/RouteProtector');
const { getClients, deleteClientById, getClientById, updateClientById } = require('../models/clients');

router.get('/api/clients', RouteProtector, async (req, res) => {
	try {
		console.log('[route] GET /clients');
		let clients = await getClients();
		console.log('[route] GET /clients result: ', clients);
		res.status(200).json({
			clients
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

module.exports = router;