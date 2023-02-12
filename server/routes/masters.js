const router = require('express').Router();
const MasterController = require('../controllers/masters');

router.get('/api/masters', MasterController.getAll);
router.post('/api/masters', MasterController.create);
router.delete('/api/masters/:id', MasterController.remove);	
router.get('/api/masters/:id', MasterController.get);	
router.put('/api/masters/:id', MasterController.update);

module.exports = router;