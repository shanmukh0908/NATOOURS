const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/APIFeatures');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factoryfunctions = require('./factoryfunctions');

const multer = require('multer');
const sharp = require('sharp');

const multerstorage = multer.memoryStorage();

const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('uploaded file is not image upload an image', 400), false);
  }
};

const upload = multer({ storage: multerstorage, fileFilter: multerfilter });

exports.uploadTourphotos = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourimages = async (req, res, next) => {
  req.files; // for fields method images are embedded in files and for single method in file
  if (!req.files.imageCover || !req.files.images) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const imagename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imagename}`);
      req.body.images.push(imagename);
    }),
  );
  next();
};

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.feilds = 'name,price,ratingsAverage,difficulty,duration';
  next();
};

exports.gettours = factoryfunctions.getall(Tour);

exports.posttour = factoryfunctions.createone(Tour);

exports.deletetour = factoryfunctions.deleteone(Tour);

exports.gettour = factoryfunctions.getone(Tour, { path: 'reviews' });

exports.updatetour = factoryfunctions.updateone(Tour);

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

exports.getTourswithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  // console.log(req.params);
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(
      new appError('please provide lat and long in this format lat,lng ', 400),
    );

  const radius = distance / 3963.2;
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  // console.log('💥💥💥', tours);

  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  // console.log(req.params);
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.00621371 : 0.001;
  if (!lat || !lng)
    return next(
      new appError('please provide lat and long in this format lat,lng ', 400),
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    { $project: { distance: 1, name: 1 } },
  ]);

  res.status(200).json({ status: 'success', data: { distances } });
});
