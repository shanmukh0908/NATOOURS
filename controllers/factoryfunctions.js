const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const APIFeatures = require('./../utils/APIFeatures');

exports.createone = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);
    res.status(201).json({ status: 'success', data: { doc } });
  });

exports.deleteone = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new appError('no doc with the given data found ', 404));
    }
    res.status(204).json({ status: 'success', data: { id: req.params.id } });
  });

exports.updateone = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new appError('no doc with the given data found ', 404));
    }
    res.status(200).json({ status: 'success', data: { doc } });
  });

exports.getone = (model, populateoptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (populateoptions) query = query.populate(populateoptions);

    const doc = await query;
    // console.log(req.params.id);
    if (!doc) {
      return next(new appError('no doc with the given data found ', 404));
    }
    res.status(200).json({ status: 'success', data: { doc } });
  });

exports.getall = (model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourid) filter = { tour: req.params.tourid }; // for sake of implementing filtering in reviews related to a specific tour id which is different from passing a filter query

    let features = new APIFeatures(model.find(filter), req.query, model)
      .filter()
      .sort()
      .limitFeilds()
      .pagination()
      .lean();

    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestedAt,
      data: { doc },
    });
  });
