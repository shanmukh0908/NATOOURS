const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const Tour = require('./../../models/tourModel');
const User = require('./../../models/userSchema');
const Review = require('./../../models/ReviewModel');

// const DB = process.env.DATABASE.replace(
//   '<db_password>',
//   process.env.MONGO_PASSWORD,
// );

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.MONGO_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('connection successful'))
  .catch(() => console.log('some error in connection'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importdevdata = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    // console.log('data succesfully loaded');
    process.exit();
  } catch (err) {
    // console.log(err);
  }
};

const deletedata = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    // console.log('data succesfully deleted');
    process.exit();
  } catch (err) {
    // console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importdevdata();
} else if (process.argv[2] === '--delete') {
  deletedata();
}
