const router = require('express').Router();
const { RouteProtector } = require('../middleware/RouteProtector');
const { getMasters, createMaster, deleteMasterById, getMasterById, updateMasterById } = require('../models/masters');

router.get('/api/masters', RouteProtector, async (req, res) => {
	try {
		console.log('[route] GET /masters');
		let masters = await getMasters();
		console.log('[route] GET /masters result: ', masters);
		res.status(200).json({
			masters
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.post('/api/masters', RouteProtector, async (req, res) => {
	try {
		const { master } = req.body;
		console.log('[route] POST /masters ', master);
		let masters = await createMaster(master);
		console.log('[route] POST /masters result: ', masters);
		res.status(200).json({
			masters
		}).end();
	} catch(e) { console.log(e); res.status(400).json(e).end(); }
});

router.delete('/api/masters/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('[route] DELETE /masters ', id);
		let result = await deleteMasterById(id);
		console.log('[route] DELETE /masters result: ', result);
		const masters = await getMasters();
		console.log('[route] DELETE /masters result: ', masters);
		res.status(200).json({
			masters
		}).end();
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.get('/api/masters/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		console.log('[route] GET /masters/:id ', id);
		let result = await getMasterById(id);
		console.log('[route] GET /masters/:id result: ', result);
		let master = result[0];
		console.log('[route] GET /masters/:id result: ', master);
		if(!master) {
			res.status(404).json({message: 'Record Not Found'}).end();
		} else {
			res.status(200).json({ master }).end();
		}
	} catch(e) { console.log(e); res.status(400).end(); }
});

router.put('/api/masters/:id', RouteProtector, async (req, res) => {
	try {
		const { id } = req.params;
		let { master } = req.body;
		console.log('[route] PUT /masters/:id ', id, master);
		let result = await updateMasterById(id, master);
		console.log('[route] PUT /masters/:id result: ', result);
		result = await getMasterById(id);
		master = result[0]; 
		console.log('[route] PUT /masters/:id result: ', master);
		if(!master) {
			res.status(404).json({message: 'Record Not Found'}).end();
		} else {
			res.status(200).json({ master }).end();
		}
	} catch(e) { console.log(e); res.status(400).json(e).end(); }
});

module.exports = router;