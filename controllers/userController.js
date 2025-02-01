const User = require('../models/userSchema');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factoryfunctions = require('./factoryfunctions');
const sharp = require('sharp'); // for image reize
const multer = require('multer'); // for uploading images

// const multerstorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerstorage = multer.memoryStorage();

const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('uploaded file is not image upload an image', 400), false);
  }
};

const upload = multer({ storage: multerstorage, fileFilter: multerfilter });

const filterObject = (obj, ...feilds) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (feilds.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getuser = factoryfunctions.getone(User);
exports.getusers = factoryfunctions.getall(User);
exports.updateuser = factoryfunctions.updateone(User);
exports.deleteuser = factoryfunctions.deleteone(User);

exports.getme = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);

  if (req.body.password || req.body.passwordConfirm)
    return next(new appError('you cannot change password here', 400));

  const filteredbody = filterObject(req.body, 'name', 'email');
  if (req.file) filteredbody.photo = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user.id, filteredbody, {
    new: true,
    runValidators: true,
  }); // user is available on req because it was assigned in protect middleware in authcontroller

  res.status(200).json({ status: 'success', data: { user: user } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false }); // user is available on req because it was assigned in protect middleware in authcontroller
  res.status(200).json({ status: 'success' });
});

exports.postuser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not defined use signup route',
  });
};

exports.uploadPhoto = upload.single('photo');

exports.resizePhoto = async (req, res, next) => {
  if (!req.file) next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};
