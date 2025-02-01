const express = require('express');
const reviewRouter = require('../routes/reviewRoutes');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use('/:tourid/reviews', reviewRouter);

router
  .route('/tours-within/:distance/centre/:latlng/unit/:unit')
  .get(tourController.getTourswithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.gettours);

router.route('/get-stats').get(tourController.getTourStats);

router
  .route('/get-monthlyplan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/')
  .get(tourController.gettours)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.posttour,
  );

router
  .route('/:id')
  .get(tourController.gettour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourphotos,
    tourController.resizeTourimages,
    tourController.updatetour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deletetour,
  );

module.exports = router;
