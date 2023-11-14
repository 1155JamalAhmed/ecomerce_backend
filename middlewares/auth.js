const AppError = require("../utils/appError");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Shop = require("../models/shopModel");

// ** checks if user is authenticated and then put it into req.user
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new AppError("Please login to continue", 401));
  }

  // ** throws error if the token is not valid or expired
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decoded.id).select("+password");

  if (!req.user) {
    return next(new AppError("User doesn't exist", 400));
  }

  next();
});

// ** checks if shop is authenticated and then put it into req.shop
exports.isShopAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { shop_token } = req.cookies;

  if (!shop_token) {
    return next(new AppError("Please login to continue", 401));
  }

  // ** throws error if the token is not valid or expired
  const decoded = jwt.verify(shop_token, process.env.JWT_SECRET_KEY);

  req.shop = await Shop.findById(decoded.id).select("+password");

  if (!req.shop) {
    return next(new AppError("Shop doesn't exist", 400));
  }

  next();
});
