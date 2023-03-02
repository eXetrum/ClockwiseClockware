const router = require('express').Router();
const OrderController = require('../controllers/orders');

router.get('/available_masters', OrderController.getFreeMasters);
router.post('/orders', OrderController.create);
router.get('/orders', OrderController.getAll);
router.delete('/orders/:id', OrderController.remove);
router.get('/orders/:id', OrderController.get);
router.put('/orders/:id', OrderController.update);

module.exports = router;