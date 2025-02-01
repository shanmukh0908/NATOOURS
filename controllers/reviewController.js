const Review = require('../models/ReviewModel');
const catchAsync = require('../utils/catchAsync');
const factoryfunctions = require('./factoryfunctions');

exports.createReviwbody = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourid;
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

exports.getAllReview = factoryfunctions.getall(Review);
exports.createReview = factoryfunctions.createone(Review);
exports.deleteReview = factoryfunctions.deleteone(Review);
exports.updateReview = factoryfunctions.updateone(Review);
exports.getReview = factoryfunctions.getone(Review);
