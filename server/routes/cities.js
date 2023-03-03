const router = require('express').Router();
const CityController = require('../controllers/cities');

router.get('/cities', CityController.getAll);
router.post('/cities', CityController.create);
router.delete('/cities/:id', CityController.remove);	
router.get('/cities/:id', CityController.get);	
router.put('/cities/:id', CityController.update);	

module.exports = router;