const Tour = require('./../models/tourModel');
const Booking = require('../models/bookingModel');
const APIFeatures = require('./../utils/APIFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factoryfunctions = require('./factoryfunctions');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.getCheckoutgsession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourid);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourid}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourid,
    line_items: [
      {
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${tour.name} tour`,
            description: tour.summary,
            images: [`https://natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  res.status(200).json({ status: 'success', session });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, price, user } = req.query;
  // console.log(tour, price, user);
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createbooking = factoryfunctions.createone(Booking);
exports.getbooking = factoryfunctions.getone(Booking);
exports.getbookings = factoryfunctions.getall(Booking);
exports.updatebooking = factoryfunctions.updateone(Booking);
exports.deletebooking = factoryfunctions.deleteone(Booking);
