const Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.feilds = 'name,price,ratingsAverage,difficulty,duration';
  next();
};

exports.gettours = async (req, res) => {
  try {
    let queryobj = { ...req.query };
    const excludedfeilds = ['page', 'sort', 'limit', 'feilds'];
    excludedfeilds.forEach((el) => delete queryobj[el]);

    let querystring = JSON.stringify(queryobj);
    querystring = querystring.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    // console.log(queryobj);
    let query = Tour.find(JSON.parse(querystring));
    // const query = Tour.find().where('duration').equals(5).wher('difficulty').equals('easy')

    if (req.query.sort) {
      const sortby = req.query.sort.split(',').join(' ');
      query = query.sort(sortby);
    } else {
      query = query.sort('-createdAt');
    }

    if (req.query.feilds) {
      const feilds = req.query.feilds.split(',').join(' ');
      // console.log(feilds);
      query = query.select(feilds);
    } else {
      query = query.select('-__v');
    }

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numDocs = await Tour.countDocuments();
      if (numDocs <= skip) throw new Error('page could not be found');
    }

    const tours = await query;
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestedAt,
      data: { tours },
    });
  } catch (err) {
    // console.log(err);
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.posttour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.gettour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // console.log(req.params.id);
    res.status(200).json({ status: 'success', data: { tour: tour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.updatetour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.deletetour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: { id: req.params.id } });
  } catch (err) {
    console.log(err);
    res.status(404).json({ status: 'fail', message: err });
  }
};
