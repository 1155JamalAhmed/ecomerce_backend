const ErrorHandler = require("../utils/appError");

const sendError = (err, req, res) => {
  console.log("Error", {
    success: false,
    message: err.message,
    error: err,
    stack: err.stack,
  });
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // ** for invalid mongodb id
  if (err.name === "CastError") {
    const message = `Resource not found with this id.. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // ** duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate key ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // ** wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = `Your token is invalid, please login again`;
    err = new ErrorHandler(message, 401);
  }

  // ** JWT is expired
  if (err.name === "TokenExpiredError") {
    const message = `Your token is Expired, please login again`;
    err = new ErrorHandler(message, 401);
  }
  // ** multer error more than specified files are uploaded
  // if (err.code === "LIMIT_UNEXPECTED_FILE") {
  //   const message = `Please provide valid number of images`;
  //   err = new ErrorHandler(message, 400);
  // }
  sendError(err, req, res);
};
