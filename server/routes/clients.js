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

router.delete('/api/clients/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('[route] DELETE /clients/:id ', id);
		let result = await deleteClientById(id);
		console.log('[route] DELETE /clients/:id del result: ', result);
		const clients = await getClients();
		console.log('[route] DELETE /clients/:id result clients array: ', clients);
		res.status(200).json({
			clients
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.get('/api/clients/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('[route] GET /clients/:id ', id);
		let result = await getClientById(id);
		console.log('[route] GET /clients/:id result: ', result);
		let client = result[0];
		console.log('[route] GET /clients/:id result: ', client);
		res.status(200).json({
			client
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.put('/api/clients/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		let { client } = req.body;
		console.log('[route] PUT /clients/:id ', id, client);
		let result = await updateClientById(id, client);
		console.log('[route] PUT /clients/:id result: ', result);
		result = await getClientById(id);
		client = result[0];
		console.log('[route] PUT /clients/:id result: ', client);
		res.status(200).json({
			client
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

module.exports = router;