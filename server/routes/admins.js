const router = require('express').Router();
const AdminController = require('../controllers/admins');

router.post('/api/register', AdminController.create);
router.post('/api/login', AdminController.login);

module.exports = router;