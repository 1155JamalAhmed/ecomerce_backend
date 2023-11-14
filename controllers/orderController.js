const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/appError");
/* 1) start 
    2) take user from req
    3) find the cart of the user as [{_id as shopId, items: [cartItems belong to that shop], totalPrice:combined prices of these products }] 
    4) is their any valid(coupon having same shop as of any cartItem) coupon applied ?
        4.1) calculateTotalPrice by first giving a discount and then create the order
    5) don't give discount and place the order
   6) end
*/
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { shippingAddress, paymentInfo, couponApplied } = req.body;

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
    name: couponApplied,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  const placedOrders = [];

  for (const { _id: shopId, items, totalPrice } of userCart) {
    if (coupon && coupon.shop.toString() === shopId.toString()) {
      placedOrders.push(
        await Order.create({
          user: user._id,
          totalAmount: totalPrice,
          couponApplied: coupon._id,
          discountedPrice: new Number(
            totalPrice * (1 - coupon.disPercentage / 100)
          ).toFixed(2),
          shippingAddress: shippingAddress,
          cart: items,
          paymentInfo: paymentInfo,
        })
      );
    } else {
      placedOrders.push(
        await Order.create({
          user: user._id,
          totalAmount: totalPrice,
          shippingAddress: shippingAddress,
          cart: items,
          paymentInfo: paymentInfo,
        })
      );
    }
  }
  res.status(200).json({
    success: true,
    body: placedOrders,
  });
});
const orderStatuses = [
  "Processing",
  "Handed to delivery partner",
  "Recieved at Wearhouse",
  "Delivering to customer",
  "Delivered",
];

exports.updateOrderByShop = catchAsyncErrors(async (req, res, next) => {
  const { orderId, newStatus } = req.body;

  const order = await Order.findOne({
    _id: orderId,
    "cart.product.shop": req.shop._id,
  });

  if (!order) {
    return next(new AppError("Order doesn't exists", 401));
  }

  const currentStatusIndex = orderStatuses.indexOf(order.status) + 1;

  if (!orderStatuses.slice(currentStatusIndex).includes(newStatus)) {
    return next(
      new AppError(
        "Order status should be one from these: " +
          orderStatuses.slice(currentStatusIndex),
        400
      )
    );
  }

  order.status = newStatus;

  const updatedOrder = await order.save();

  res.status(201).json({
    success: true,
    body: updatedOrder,
  });
});
