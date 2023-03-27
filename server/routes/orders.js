const router = require('express').Router();
const OrderController = require('../controllers/orders');

router.get('/orders', OrderController.getAll);
router.post('/orders', OrderController.create);
router.delete('/orders/:id', OrderController.remove);
router.get('/orders/:id', OrderController.get);
router.put('/orders/:id', OrderController.update);
router.patch('/orders/:id', OrderController.patch);

module.exports = router;
