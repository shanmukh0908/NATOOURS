const mongoose = require('mongoose');
const Tour = require('./tourModel');

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review is required'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: { type: Date, default: Date.now() },

    tour: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'this review must belong top some tour'],
      ref: 'Tour',
    },

    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'review is given by a user'],
      ref: 'User',
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

ReviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name -guides ',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

ReviewSchema.statics.calcRatingsaverage = async function (tourId) {
  // in statics method this points to model
  // console.log(tourId);
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nratings: { $sum: 1 },
        ratingsavg: { $avg: '$rating' },
      },
    },
  ]);

  // console.log(stats, '💥');

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nratings,
      ratingsAverage: stats[0].ratingsavg,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

ReviewSchema.post('save', function () {
  this.constructor.calcRatingsaverage(this.tour);
});

ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // console.log(this.r._id, '💥💥');
  next();
});

ReviewSchema.post(/^findOneAnd/, async function () {
  // we cannot use this.findOne() in post method so we are setting an object r into the query which is nothing but the review doc itself
  await this.r.constructor.calcRatingsaverage(this.r.tour._id);
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
