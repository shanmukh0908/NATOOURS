const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/APIFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factoryfunctions = require('./factoryfunctions');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.feilds = 'name,price,ratingsAverage,difficulty,duration';
  next();
};

exports.gettours = catchAsync(async (req, res, next) => {
  let features = new APIFeatures(Tour.find(), req.query, Tour)
    .filter()
    .sort()
    .limitFeilds()
    .pagination()
    .lean();

  const tours = await features.query;
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestedAt,
    data: { tours },
  });
});

exports.posttour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(201).json({ status: 'success', data: { tour } });
});

exports.gettour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  // console.log(req.params.id);
  if (!tour) {
    return next(new appError('no tour with the given data found ', 404));
  }
  res.status(200).json({ status: 'success', data: { tour: tour } });
});

exports.updatetour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new appError('no tour with the given data found ', 404));
  }
  res.status(200).json({ status: 'success', data: { tour } });
});

exports.deletetour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new appError('no tour with the given data found ', 404));
  }
  res.status(204).json({ status: 'success', data: { id: req.params.id } });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    { $match: { _id: { $ne: 'EASY' } } },
  ]);
  res.status(200).json({ status: 'success', data: stats });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  // console.log(year);
  const monthlyplan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numTours: -1 } },
  ]);
  res.status(200).json({ status: 'success', data: monthlyplan });
});
