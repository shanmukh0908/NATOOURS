// const User = require('./userSchema');

const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'name is required for a tour'],
      minlength: [5, 'name should be atleast 5 cahrecters long'],
      maxlength: [40, 'name should not be more than 40 charecters length'],
    },
    secretTour: { type: Boolean, default: false },
    slug: String,
    price: {
      type: Number,
      required: [true, 'price is required for a tour'],
    },
    priceDiscount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          // this her points to the newly created document only and it doesnt work with update method
          return val < this.price;
        },
        message: 'discount price({VALUE}) cannot be more than actual price',
      },
    },
    startLocation: {
      // geo json
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    rating: { type: Number, default: 4.5 },
    duration: { type: Number, require: [true, 'duration is required'] },
    maxGroupSize: { type: Number, require: [true, 'group isze is required'] },
    difficulty: {
      type: String,
      required: [true, 'difficulty isze is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'enter only easy or medium or difficult in difficulty feild',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'min rating cannot be less than 1'],
      max: [5, 'max ratings cannot be greater than 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: { type: Number, default: 0 },
    summary: { type: String, trim: true },
    description: { type: String, require: [true, 'description is required'] },
    imageCover: {
      type: String,
      require: [true, 'coverimage feild is required'],
    },
    images: [String],
    createdAt: { type: Date, default: Date.now() },
    startDates: [Date],
    // guides: Array, embedding guides
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });

// this middleware works on documnets and works only on create(),and save() meethods
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  // console.log('in pre middleare');
  next();
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// ______________** embedding tour guides**____________________________

// tourSchema.pre('save', async function (next) {
//   const guides = await Promise.all(
//     this.guides.map(async (el) => {
//       return await User.findById(el);
//     }),
//   );
//   this.guides = guides;

//   next();
// });

// tourSchema.post('save', function (doc,next) {
//   console.log(doc);
//   next();
// });

//query middleware

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordchangedate',
  });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   // console.log(`request took ${-this.start + Date.now()} milliseconds `);
//   next();
// });

// aggregate middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
