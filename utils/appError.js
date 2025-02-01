class appError extends Error {
  constructor(message, statusCode) {
    super(message); // here message parameter is assigned to the message property of the Error object
    this.data = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = appError;
