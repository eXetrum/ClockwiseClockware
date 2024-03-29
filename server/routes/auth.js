const router = require('express').Router();
const AuthController = require('../controllers/auth');

router.post('/register', AuthController.create);
router.post('/login', AuthController.login);
router.get('/verify/:token', AuthController.verify);

router.post('/reset_password', AuthController.resetPassword);
router.post('/resend_email_confirmation', AuthController.resendEmailConfirmation);

router.post('/auth/google', AuthController.googleAuth);

module.exports = router;
