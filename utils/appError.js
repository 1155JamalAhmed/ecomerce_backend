// ** Inherited the Error class to ErrorHandler Class

class AppError extends Error {
  // ** ErrorHandler constructor
  // ** run the constructor of the Error class and
  // ** create our own statusCode instance variable
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
