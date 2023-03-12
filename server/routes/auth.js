const router = require('express').Router();
const AuthController = require('../controllers/auth');

router.post('/register', AuthController.create);
router.post('/login', AuthController.login);

module.exports = router;
