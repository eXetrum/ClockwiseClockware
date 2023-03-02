const router = require('express').Router();
const WatchController = require('../controllers/watches');

router.get('/api/watches', WatchController.get);

module.exports = router;