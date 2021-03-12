const express = require('express');

const router = express.Router();

const tourController = require('../controller/tourController');
const authController = require('../controller/authController');

router.param('id', tourController.checkParamId);

router
  .route('/top-5-cheap')
  .get(tourController.getTopFiveTours, tourController.getAllTours);

router.route('/stats').get(tourController.getToursStats);

router
  .route('/')
  .get(authController.protect,tourController.getAllTours)
  //.post(tourController.checkBody,tourController.createTour);
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);

module.exports = router;
