const router = require('express').Router();
const WatchController = require('../controllers/watches');

router.get('/watches', WatchController.get);

module.exports = router;