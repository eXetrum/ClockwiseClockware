const router = require('express').Router();
const CityController = require('../controllers/cities');

router.get('/api/cities', CityController.getAll);
router.post('/api/cities', CityController.create);
router.delete('/api/cities/:id', CityController.remove);	
router.get('/api/cities/:id', CityController.get);	
router.put('/api/cities/:id', CityController.update);	

module.exports = router;