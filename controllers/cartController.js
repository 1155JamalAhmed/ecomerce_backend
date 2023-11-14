const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Cart = require("../models/cartModel");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");

exports.addItemToCart = catchAsyncErrors(async (req, res, next) => {
  // query works as * is the item exists ? update and else add it
  // return the updated item
  if (
    req.body?.incrementQuantityBy < 1 ||
    !mongoose.Types.ObjectId.isValid(req.body.productId)
  ) {
    return next(new AppError("Request is having incorrect data", 400));
  }
  const cartItem = await Cart.findOneAndUpdate(
    {
      product: req.body.productId,
      user: req.user._id,
    },
    { $inc: { quantity: req.body.incrementQuantityBy } },
    { upsert: true, new: true }
  ).populate("product");

  res.status(201).json({
    success: true,
    body: cartItem,
  });
});

exports.incrementQuantityByOne = catchAsyncErrors(async (req, res, next) => {
  const cartItem = await Cart.findOneAndUpdate(
    {
      _id: req.body.cartItemId,
      user: req.user._id,
    },
    { $inc: { quantity: 1 } },
    { new: true }
  ).populate("product");

  if (!cartItem) {
    return next(new AppError("This item doesn't exists", 400));
  }

  res.status(201).json({
    success: true,
    body: cartItem,
  });
});

exports.decrementQuantityByOne = catchAsyncErrors(async (req, res, next) => {
  let cartItem = null;
  cartItem = await Cart.findOneAndUpdate(
    {
      _id: req.body.cartItemId,
      user: req.user._id,
      quantity: { $gt: 1 },
    },
    { $inc: { quantity: -1 } },
    { new: true }
  ).populate("product");

  if (!cartItem) {
    cartItem = await Cart.findOneAndDelete({
      _id: req.body.cartItemId,
      user: req.user._id,
      quantity: 1,
    }).populate("product");
  }

  if (!cartItem) {
    return next(new AppError("This item doesn't exists", 400));
  }

  res.status(201).json({
    success: true,
    body: cartItem,
  });
});

exports.deleteItemFromCart = catchAsyncErrors(async (req, res, next) => {
  const item = await Cart.findOneAndDelete({
    _id: req.params.cartItemId,
    user: req.user._id,
  }).populate("product");

  if (!item) {
    return next(new AppError("The cart item doesn't exists", 400));
  }

  res.status(200).json({
    success: true,
    body: item,
  });
});

exports.getCartByUser = catchAsyncErrors(async (req, res, next) => {
  const cartData = await Cart.find({ user: req.user._id }).populate("product");

  let grandTotal = 0;

  cartData.forEach((item) => {
    grandTotal += item.quantity * item.product.discountPrice;
  });

  res.status(200).json({
    success: true,
    body: { cartData, grandTotal },
  });
});

exports.deleteCartByUser = catchAsyncErrors(async (req, res, next) => {
  await Cart.deleteMany({ user: req.user._id });
  res.status(200).json({
    success: true,
    body: {
      message: "Cart deleted successfull",
    },
  });
});
