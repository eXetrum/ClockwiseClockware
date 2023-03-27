const router = require('express').Router();
const MasterController = require('../controllers/masters');

router.get('/masters/available', MasterController.getAvailableMasters);
router.get('/masters', MasterController.getAll);
router.post('/masters', MasterController.create);
router.delete('/masters/:id', MasterController.remove);
router.get('/masters/:id', MasterController.get);
router.put('/masters/:id', MasterController.update);

module.exports = router;
