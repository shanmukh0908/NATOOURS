const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'booking must belong to some tour'],
    ref: 'Tour',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'booking must belong to some user'],
    ref: 'User',
  },
  price: { type: Number, required: [true, 'booking must have some price'] },
  createdAt: { type: Date, default: Date.now() },
  paid: { type: Boolean, default: true },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' }).populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
