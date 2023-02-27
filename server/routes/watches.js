const router = require('express').Router();
const WatchController = require('../controllers/watches');

///////// Client part (No route protection)
router.get('/api/watches', WatchController.get);

module.exports = router;