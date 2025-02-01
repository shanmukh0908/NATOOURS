const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.use(authController.isLoggedin);

router.get('/login', viewsController.getLoginform);
router.get(
  '/',
  bookingController.createBookingCheckout,
  viewsController.getOverview,
);
router.get('/tour/:slug', viewsController.getTourdetails);
router.get('/account', viewsController.getaccount);
router.get('/my-tours', viewsController.getmytours);
router.post('/update-user-data', viewsController.updateUserdata);

module.exports = router;
