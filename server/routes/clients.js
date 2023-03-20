const router = require('express').Router();
const ClientController = require('../controllers/clients');

router.get('/clients', ClientController.getAll);
router.post('/clients', ClientController.create);
router.delete('/clients/:id', ClientController.remove);
router.get('/clients/:id', ClientController.get);
router.put('/clients/:id', ClientController.update);

module.exports = router;
