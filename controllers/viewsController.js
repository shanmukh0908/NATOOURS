const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const appError = require('../utils/appError');
const User = require('../models/userSchema');
const Booking = require('../models/bookingModel');
exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTourdetails = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // console.log(tour);
  if (!tour) {
    // console.log('no tour');
    return next(new appError('no tour with that name', 404));
  }
  // console.log(req.params);
  // console.log(tour);
  // console.log(tour.reviews);
  res.status(200).render('tour', { title: tour.name, tour });
});

exports.getLoginform = (req, res) => {
  res.status(200).render('login', { title: 'log in' });
};

exports.getaccount = (req, res) => {
  res.status(200).render('account', { title: 'account' });
};

exports.getmytours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourids = bookings.map((booking) => booking.tour);
  const tours = await Tour.find({ _id: { $in: tourids } });
  // console.log('in my tours 💠💠', tours, tourids);
  res.status(200).render('overview', { title: 'my tours', tours });
});

exports.updateUserdata = catchAsync(async (req, res, next) => {
  // console.log('💥💥💥', req.body);
  const email = req.body.email;
  const name = req.body.name;
  const updateduser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name,
      email,
    },
    { new: true, runValidators: true },
  );

  res
    .status(200)
    .render('account', { title: 'your account', user: updateduser });
});
