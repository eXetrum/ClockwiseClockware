const router = require('express').Router();
const ClientController = require('../controllers/clients');

router.get('/api/clients', ClientController.getAll);
router.delete('/api/clients/:id', ClientController.remove);	
router.get('/api/clients/:id', ClientController.get);	
router.put('/api/clients/:id', ClientController.update);

module.exports = router;