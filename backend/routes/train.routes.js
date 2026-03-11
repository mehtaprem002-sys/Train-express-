const express = require('express');
const router = express.Router();
const trainController = require('../controllers/train.controller');
const { auth, admin } = require('../middleware/auth');

router.get('/search', trainController.searchTrains);
router.get('/stations', trainController.getStations);
router.get('/admin/all', auth, admin, trainController.getAllTrains);
router.post('/', auth, admin, trainController.createTrain);
router.put('/:id', auth, admin, trainController.updateTrain);
router.delete('/:id', auth, admin, trainController.deleteTrain);

// Station Admin Routes
router.get('/admin/stations', auth, admin, trainController.getAdminStations);
router.post('/admin/stations', auth, admin, trainController.createStation);
router.put('/admin/stations/:id', auth, admin, trainController.updateStation);
router.delete('/admin/stations/:id', auth, admin, trainController.deleteStation);
router.get('/live-status/:trainNumber', trainController.getLiveStatus);

module.exports = router;

