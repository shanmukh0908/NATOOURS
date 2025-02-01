const User = require('../models/userSchema');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jsonwebtoken = require('jsonwebtoken');
const { promisify } = require('util');
const sendMail = require('./../utils/email');
const crypto = require('crypto');
const Email = require('../utils/email');

const genToken = (uid) => {
  return jsonwebtoken.sign({ id: uid }, process.env.TOKEN_SECRET, {
    expiresIn: '90d',
  });
};

const createsendtoken = (uid, statuscode, res, data = null) => {
  const token = genToken(uid);
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    domain: '127.0.0.1',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  // user.password = undefined;

  res.status(statuscode).json({
    status: 'success',
    token,
    data: {
      data,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    //   passwordToken: req.body.passwordToken,
    // passwordExpiry: Date,
  });
  // console.log(process.env.TOKEN_SECRET);
  const url = `${req.protocol}://${req.get('host')}/account`;
  await new Email(user, url).sendwelcomemail();
  createsendtoken(user._id, 201, res, user);

  // res.status(201).json({ status: 'success', token, data: { user } });
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // console.log(email, password);
  if (!email || !password)
    return next(new appError('both email and password are required', 401));
  const user = await User.findOne({ email }).select('+password');
  // console.log(user);
  if (user) {
    if (!(await user.correctPassword(password, user.password)))
      return next(new appError('enter valid email and password', 401));
  }
  createsendtoken(user._id, 201, res, user);
});

exports.logout = async (req, res, next) => {
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // console.log(req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
    // console.log('💥 cookie:', token);
  }
  if (!token)
    return next(new appError('you are not logged in please log in', 401));

  const decoded = await promisify(jsonwebtoken.verify)(
    token,
    process.env.TOKEN_SECRET,
  );

  // console.log(decoded);
  const loggedinuser = await User.findById(decoded.id);

  // console.log(loggedinuser);
  if (!loggedinuser)
    return next(
      new appError('please login if account exists already else signup', 401),
    );

  if (await loggedinuser.afterPasswordChange(decoded.iat))
    return next(
      new appError('password changed recently please login again', 401),
    );

  req.user = loggedinuser;
  // console.log('the user 2', req.user);
  next();
});

exports.isLoggedin = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jsonwebtoken.verify)(
        req.cookies.jwt,
        process.env.TOKEN_SECRET,
      );

      // console.log(decoded);

      const loggedinuser = await User.findById(decoded.id);
      if (!loggedinuser) return next();

      if (await loggedinuser.afterPasswordChange(decoded.iat)) return next();

      res.locals.user = loggedinuser;
      req.user = loggedinuser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new appError('you are not authorized to perform this task ', 401),
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new appError('email not found ', 404));
  const resettoken = user.createPasswordtoken();
  // console.log(resettoken, user.passwordToken);

  user.save({ validateBeforeSave: false });
  const url = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resettoken}`;
  // const options = {
  //   email: 'shanmukh0908@gmail.com',
  //   subject: 'password reset link valid for 10 mins',
  //   message: url,
  // };

  await new Email(user, url).sendpasswordresetmail();

  res.status(201).json({ status: 'token sent to email' });
});

exports.resetpassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const encrypt = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordToken: encrypt,
    passwordExpiry: { $gt: Date.now() },
  });
  if (!user)
    return next(new appError('error is resetting password try again', 500));
  user.resetpassword(req.body.password, req.body.passwordConfirm);
  user.passwordExpiry = undefined;
  user.passwordToken = undefined;
  await user.save();
  createsendtoken(user._id, 201, res);
});

exports.changemypassowrd = catchAsync(async (req, res, next) => {
  console.log('the user', req.user);
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new appError('invalid password try again', 401));
  user.resetpassword(req.body.newPassword, req.body.newPasswordconfirm);
  await user.save();
  createsendtoken(user._id, 201, res);
  next();
});
