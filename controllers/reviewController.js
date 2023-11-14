const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Order = require("../models/orderModel");
const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

function customRoundRating(rating) {
  if (rating < 1) {
    return 1;
  } else if (rating > 5) {
    return 5;
  } else {
    return Math.round(rating * 2) / 2;
  }
}

exports.writeReviewOnProduct = catchAsyncErrors(async (req, res, next) => {
  const { orderId, productId, rating, review } = req.body;
  const order = await Order.findOne({
    _id: orderId,
    cart: {
      $elemMatch: {
        "product._id": new mongoose.Types.ObjectId(productId),
      },
    },
    status: "Delivered",
    user: req.user._id,
  });

  if (!order) {
    return next(new AppError("You didn't bought this product", 401));
  }

  const reviewPlaced = await Review.findOneAndUpdate(
    {
      user: req.user._id,
      product: productId,
      order: orderId,
    },
    {
      $set: {
        rating: customRoundRating(rating),
        review: review,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    success: true,
    body: reviewPlaced,
  });
});

exports.getReviewsByOrder = catchAsyncErrors(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findOne({
    _id: orderId,
    status: "Delivered",
    user: req.user._id,
  });
  if (!order) {
    return next(new AppError("Order is not delivered yet!", 400));
  }
  const reviewsOfOrder = await Review.find({
    order: orderId,
  });
  res.status(200).json({
    success: true,
    body: reviewsOfOrder,
  });
});

exports.getReviewsByShop = catchAsyncErrors(async (req, res, next) => {
  const { shopId } = req.params;

  const reviewsOnShop = await Review.aggregate([
    {
      $lookup: {
        localField: "product",
        foreignField: "_id",
        from: "products",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $match: {
        "product.shop": new mongoose.Types.ObjectId(shopId),
      },
    },
    {
      $lookup: {
        localField: "user",
        foreignField: "_id",
        from: "users",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
  ]);

  res.status(200).json({
    success: true,
    body: reviewsOnShop,
  });
});
