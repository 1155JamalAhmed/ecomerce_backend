const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Wishlist = require("../models/wishlistModel");
const AppError = require("../utils/appError");
const Cart = require("../models/cartModel");
const mongoose = require("mongoose");

exports.addItemToWishlist = catchAsyncErrors(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.body.productId)) {
    return next(new AppError("Please provide a valid productId"));
  }
  const isItemExists = await Wishlist.findOne({
    product: req.body.productId,
    user: req.user._id,
  });

  if (isItemExists) {
    return next(new AppError("Item already exists is wishlist", 400));
  }

  const item = await (
    await Wishlist.create({
      product: req.body.productId,
      user: req.user._id,
    })
  ).populate("product");

  res.status(201).json({
    success: true,
    body: item,
  });
});
exports.removeItemFromWishlist = catchAsyncErrors(async (req, res, next) => {
  const item = await Wishlist.findOneAndDelete({
    _id: req.params.itemId,
    user: req.user._id,
  }).populate("product");

  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  res.status(200).json({
    success: true,
    body: item,
  });
});
exports.wishlistItemToCart = catchAsyncErrors(async (req, res, next) => {
  const item = await Wishlist.findOneAndDelete({
    _id: req.body.itemId,
    user: req.user._id,
  });

  if (!item) {
    return next(new AppError("This item doesn't exists", 404));
  }

  const cartItem = await Cart.findOneAndUpdate(
    {
      product: item.product._id,
      user: req.user._id,
    },
    { $inc: { quantity: 1 } },
    { upsert: true, new: true }
  ).populate("product");

  res.status(200).json({
    success: true,
    body: {
      wishlistItem: item,
      cartItem: cartItem,
    },
  });
});
exports.getWishlist = catchAsyncErrors(async (req, res, next) => {
  const items = await Wishlist.find({
    user: req.user._id,
  }).populate("product");

  res.status(200).json({
    success: true,
    body: items,
  });
});
