const fs = require("fs");
const Shop = require("../models/shopModel");
const Product = require("../models/productModel");
const Event = require("../models/eventModel");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const { createJwtToken } = require("../utils/createJwtToken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const Order = require("../models/orderModel");
const dayjs = require("dayjs");

exports.createShop = catchAsyncErrors(async (req, res, next) => {
  const { email, name, phone, address, zipCode, password } = req.body;

  if (!email) {
    return next(new AppError("Please provide email address", 400));
  }

  const shop = await Shop.findOne({ email });

  if (shop) {
    fs.unlink(`upload/${req.file.filename}`, (err) => {
      if (err) {
        console.log("Error in deleting shop image");
      } else {
        console.log("Shop image has been deleted because shop already exists");
      }
    });
    return next(new AppError("Shop already exists!", 400));
  }
  const avatarImage = `shopImages/${req.file.filename}`;

  const newShop = {
    email,
    name,
    phone,
    address,
    zipCode,
    password,
    avatarImage,
  };

  const activationToken = createJwtToken(newShop);
  const activationUrl = `http://localhost:3000/shops/activation/${activationToken}`;

  await sendMail({
    email: newShop.email,
    subject: "Activate your asccount",
    message: `hello ${newShop.name}, please click on the link to activate your account: ${activationUrl}`,
  });

  res.status(201).json({
    success: true,
    message: `Please check your email: ${newShop.email} to activate your acccount`,
  });
});

exports.activateShop = catchAsyncErrors(async (req, res, next) => {
  const { activation_token } = req.body;

  // ** if the token is expired, it will throw error and we catch it in the error middleware
  const decodedJwt = jwt.verify(activation_token, process.env.JWT_SECRET_KEY);

  const { email, name, phone, address, zipCode, password, avatarImage } =
    decodedJwt;

  const shop = await Shop.findOne({ email });

  if (shop) {
    return next(new AppError("Token has been used, please login", 400));
  }

  const newShop = await Shop.create({
    email,
    name,
    phone,
    address,
    zipCode,
    password,
    avatarImage,
  });

  // remember is true by default
  sendToken(newShop, 201, res, true, "shop_token");
});

exports.loginShop = catchAsyncErrors(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide all the fields", 400));
  }

  const shop = await Shop.findOne({ email }).select("+password");

  if (!shop) {
    return next(new AppError("Shop doesn't exit, please sign up!", 400));
  }

  const isPasswordValid = await shop.comparePassword(password);

  if (!isPasswordValid) {
    return next(new AppError("Please provide correct information", 401));
  }

  sendToken(shop, 200, res, rememberMe, "shop_token");
});

exports.logoutShop = catchAsyncErrors(async (req, res, next) => {
  res.cookie("shop_token", null, {
    expiresIn: new Date(),
    httpOnly: true,
  });
  res.status(201).json({
    success: true,
    message: "Shop logged out successfully",
  });
});

exports.getShop = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ "cart.product.shop": req.shop._id });
  const shop = req.shop.toObject();
  shop.orders = orders;
  res.status(200).json({
    success: true,
    body: shop,
  });
});

exports.getShopById = catchAsyncErrors(async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    return next(new AppError("Shop not found", 404));
  }
  const shopProducts = await Product.find({ shop: shop._id }).sort({
    createdAt: -1,
  });
  const shopEvents = await Event.find({ shop: shop._id }).sort({
    endDate: -1,
    createdAt: -1,
  });
  res.status(200).json({
    success: true,
    body: { shop: shop, products: shopProducts, events: shopEvents },
  });
});

exports.updateShop = catchAsyncErrors(async (req, res, next) => {
  const { name, phoneNumber, currentPassword } = req.body;
  console.log(name, phoneNumber, currentPassword);

  if (
    !currentPassword ||
    !name ||
    !phoneNumber ||
    name?.trim().length === 0 ||
    phoneNumber?.trim().length === 0 ||
    currentPassword?.trim().length === 0
  ) {
    return next(
      new AppError(
        "Please provide valid name, phoneNumber and currentPassword",
        400
      )
    );
  }

  const isPasswordValid = await req.shop.comparePassword(currentPassword);

  if (!isPasswordValid) {
    return next(new AppError("Please provide correct password", 401));
  }

  req.shop.name = name;
  req.shop.phone = phoneNumber;
  const updatedShop = await req.shop.save();

  res.status(200).json({
    success: true,
    body: updatedShop,
  });
});

exports.changeAvatarImage = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please provide new profile picture", 400));
  }
  const oldAvatartImage = req.shop.avatarImage;

  fs.unlink(`uploads/${oldAvatartImage}`, (err) => {
    if (err) {
      console.log("old shop image doesn't get deleted", err);
    } else {
      console.log("old shop image has been deleted");
    }
  });

  const newAvatarImage = `shopImages/${req.file.filename}`;
  req.shop.avatarImage = newAvatarImage;
  const updatedShop = await req.shop.save();

  res.status(200).json({
    success: true,
    body: updatedShop,
  });
});

exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword) {
    return next(new AppError("Please provide current password", 401));
  }
  const passwordIsCorrect = await req.shop.comparePassword(currentPassword);
  if (!passwordIsCorrect) {
    return next(new AppError("Current Password is not correct", 401));
  }

  req.shop.password = newPassword;
  await req.shop.save();

  res.status(200).json({
    success: true,
    body: { message: "Password changed successfully" },
  });
});

exports.getOrderStatsOf6MonthByShop = catchAsyncErrors(
  async (req, res, next) => {
    const currentDate = dayjs();
    const startDate = currentDate
      .subtract(6, "month")
      .startOf("month")
      .add(5, "hour")
      .toDate();

    const ordersOfLast6Months = await Order.aggregate([
      {
        $match: {
          "cart.product.shop": req.shop._id,
          placedOn: { $gte: startDate, $lte: currentDate.toDate() },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$placedOn" },
            month: { $month: "$placedOn" },
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1, "_id.year": 1 },
      },
      {
        $addFields: {
          month: {
            $let: {
              vars: {
                months: [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
              },
              in: {
                $arrayElemAt: ["$$months", { $subtract: ["$_id.month", 1] }],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: 1,
          totalOrders: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      body: ordersOfLast6Months,
    });
  }
);

exports.getOrdersOnCityByShop = catchAsyncErrors(async (req, res, next) => {
  const orderStats = await Order.aggregate([
    {
      $match: { "cart.product.shop": req.shop._id },
    },
    {
      $group: {
        _id: "$shippingAddress.city",
        value: { $sum: 1 },
      },
    },
    {
      $addFields: {
        id: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
        id: 1,
        value: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    body: orderStats,
  });
});
