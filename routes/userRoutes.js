const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/signin').post(authController.signin);
router.route('/logout').get(authController.logout);

router.route('/forgotpassword').post(authController.forgotPassword);
router.route('/resetpassword/:token').patch(authController.resetpassword);

router.use(authController.protect); // from here below methods only work for signed in users

router
  .route('/updateme')
  .patch(
    userController.uploadPhoto,
    userController.resizePhoto,
    userController.updateMe,
  );

router.route('/getme').get(userController.getme, userController.getuser);

router.route('/deleteme').delete(userController.deleteMe);

router.route('/changemypassword').patch(authController.changemypassowrd);

router.use(authController.restrictTo('admin')); // from here below methods only work for admin users

router.route('/').get(userController.getusers).post(userController.postuser);
router
  .route('/:id')
  .get(userController.getuser)
  .patch(userController.updateuser)
  .delete(userController.deleteuser);

module.exports = router;
