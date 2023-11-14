const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");

const calculateOrderAmount = async (couponName, req) => {
  const user = req.user;
  // from user get cart
  const userCart = await Cart.aggregate([
    { $match: { user: user._id } },
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
      $group: {
        _id: "$product.shop",
        items: { $push: "$$ROOT" },
        totalPrice: {
          $sum: { $multiply: ["$product.discountPrice", "$quantity"] },
        },
      },
    },
  ]);

  const coupon = await Coupon.findOne({
    name: couponName,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  let totalAmountAfterDiscount = 0;
  let totalAmount = 0;
  for (const { _id: shopId, totalPrice } of userCart) {
    if (coupon && coupon.shop.toString() === shopId.toString()) {
      totalAmountAfterDiscount += totalPrice * (1 - coupon.disPercentage / 100);
    } else {
      totalAmountAfterDiscount += totalPrice;
    }
    totalAmount += totalPrice;
  }

  const shippingCost = totalAmount * 0.01;
  totalAmountAfterDiscount += shippingCost;

  return Math.round(totalAmountAfterDiscount * 100);
};

exports.createPaymentIntent = catchAsyncErrors(async (req, res, next) => {
  const totalAmount = await calculateOrderAmount(req.body.appliedCoupon, req);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: "usd",
    metadata: {
      company: "Ecommerce",
    },
  });

  res.status(201).json({
    success: true,
    body: { clientSecret: paymentIntent.client_secret },
  });
});
