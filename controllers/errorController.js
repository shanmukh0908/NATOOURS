const appError = require('./../utils/appError');

const sendDevError = (res, err, req) => {
  console.log('dev error 💥🛠', err.data);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendProdError = (res, err, req) => {
  if (err.isOperational) {
    // console.log('the operational prod err ', err);
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    return res
      .status(err.statusCode)
      .render('error', { title: 'some thing went wrong', msg: err.message });
  }

  if (req.originalUrl.startswith('/api')) {
    return res.status(500).json({
      status: 'error',
      err: err,
      message: 'some thing went very wrong',
    });
  }

  res
    .status(err.statusCode)
    .render('error', { title: 'some thing went wrong', msg: err.message });
};

const handleCastError = (error) => {
  const message = `invalid ${error.path} : ${error.value}`;
  return new appError(message, 404);
};

const handleDuplicate = (error) => {
  const value = Object.values(error.keyValue);
  const value2 = Object.keys(error.keyPattern);
  // const feild = Object.values(error.KeyPattern);
  const message = `duplicate  ${value2} : ${value}  given : ${value2} exists already `;
  return new appError(message, 400);
};

const handleValidationError = (error) => {
  // console.log(error);
  const errors = Object.values(error.errors).map((el) => el.message);
  const message = `invalid input data  : ${errors.join('. ')}`;
  return new appError(message, 400);
};

const handleJsonWebTokenError = () => {
  return new appError('please login and try again', 401);
};
const handleTokenExpiredError = () => {
  return new appError('session expired try again after login', 401);
};

const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // console.log('the error', err);
  // console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    sendDevError(res, err, req);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicate(error);
    if (err.errors) {
      Object.values(err.errors).find((el) => el.name === 'ValidatorError');
      error = handleValidationError(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();

    sendProdError(res, error, req);
  }
};

module.exports = errorController;
