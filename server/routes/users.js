const router = require('express').Router();
const UserController = require('../controllers/users');

router.post('/api/register', UserController.create);
router.post('/api/login', UserController.login);

module.exports = router;