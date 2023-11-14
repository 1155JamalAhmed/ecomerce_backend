const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");
const AppError = require("../utils/appError");

exports.createCoupon = catchAsyncErrors(async (req, res, next) => {
  const isCouponExists = await Coupon.findOne({
    name: req.body.name,
    shop: req.shop._id,
  });

  if (isCouponExists) {
    return next(
      new AppError(
        "Coupon name is already exists, please create another one",
        400
      )
    );
  }

  const createdCoupon = await Coupon.create({
    ...req.body,
    shop: req.shop._id,
  });

  res.status(201).json({
    success: true,
    body: createdCoupon,
  });
});

exports.getAllCouponByShop = catchAsyncErrors(async (req, res, next) => {
  const allCoupons = await Coupon.find({ shop: req.params.id });
  res.status(200).json({
    success: true,
    body: allCoupons,
  });
});

exports.deleteCoupon = catchAsyncErrors(async (req, res, next) => {
  const deletedCoupon = await Coupon.findOneAndDelete({
    _id: req.body.couponId,
    shop: req.shop._id,
  });

  if (!deletedCoupon) {
    return next(
      new AppError("Your shop doesn't have this coupon anymore", 404)
    );
  }

  res.status(200).json({
    success: true,
    body: deletedCoupon,
  });
});

exports.getDiscountByCouponCode = catchAsyncErrors(async (req, res, next) => {
  const coupon = await Coupon.findOne({
    name: req.params.couponCode,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  if (!coupon) {
    return next(
      new AppError(
        "The coupon code doesn't exist or is expired or is not started yet",
        404
      )
    );
  }

  const data = await Cart.aggregate([
    { $match: { user: req.user._id } },
    {
      $lookup: {
        from: "products",
        foreignField: "_id",
        localField: "product",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $match: { "product.shop": coupon.shop },
    },
    {
      $group: {
        _id: null,
        discountAvailableOn: { $push: "$$ROOT" },
        totalDiscount: {
          $sum: {
            $multiply: [
              { $divide: [coupon.disPercentage, 100] },
              "$product.discountPrice",
              "$quantity",
            ],
          },
        },
      },
    },
    { $project: { _id: 0 } },
  ]);

  if (!data[0]) {
    return next(new AppError("Coupon code doesn't exists", 400));
  }

  const { discountAvailableOn, totalDiscount } = data[0];

  res.status(200).json({
    success: true,
    body: {
      discountAvailableOn,
      totalDiscount,
      disParcentage: coupon.disPercentage,
    },
  });
});
