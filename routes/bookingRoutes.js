const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/checkout-session/:tourid')
  .get(bookingController.getCheckoutgsession);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(bookingController.getbookings)
  .post(bookingController.createbooking);

router
  .route('/:id')
  .get(bookingController.getbooking)
  .patch(bookingController.updatebooking)
  .delete(bookingController.deletebooking);

module.exports = router;
