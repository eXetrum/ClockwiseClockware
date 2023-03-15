const router = require('express').Router();
const AuthController = require('../controllers/auth');

router.post('/register', AuthController.create);
router.post('/login', AuthController.login);
router.get('/verify', AuthController.verify);

router.post('/reset_password', AuthController.resetPassword);
router.post('/resend_email_confirmation', AuthController.resendEmailConfirmation);

module.exports = router;
