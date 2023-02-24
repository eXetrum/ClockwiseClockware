const router = require('express').Router();
const OrderController = require('../controllers/orders');

///////// Client part (No route protection)
router.get('/api/watches', OrderController.getWatches);
router.get('/api/available_masters', OrderController.getFreeMasters);
router.post('/api/orders', OrderController.create);

///////// Admin part (WITH route protection)
router.get('/api/orders', OrderController.getAll);
router.delete('/api/orders/:id', OrderController.remove);
router.get('/api/orders/:id', OrderController.get);
router.put('/api/orders/:id', OrderController.update);

module.exports = router;