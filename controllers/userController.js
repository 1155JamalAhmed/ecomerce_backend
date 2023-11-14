const fs = require("fs");
const jwt = require("jsonwebtoken");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/appError");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { createJwtToken } = require("../utils/createJwtToken");
const Order = require("../models/orderModel");
const _ = require("lodash");

// ** MODELS
const User = require("../models/userModel");

// ** creating a new user
exports.createUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!email) {
    return next(new AppError("Please provide email address", 400));
  }

  const user = await User.findOne({ email });

  if (user) {
    fs.unlink(
      `uploads/userImages/${req.files.avatarImage[0].filename}`,
      (err) => {
        if (err) {
          console.log("Error in deleting avatar image", err);
        } else {
          console.log("User avatar image has been deleted!");
        }
      }
    );
    if (req.files.bannerImage) {
      fs.unlink(
        `uploads/userImages/${req.files.bannerImage[0].filename}`,
        (err) => {
          if (err) {
            console.log("Error in deleting banner image", err);
          } else {
            console.log("User banner image has been deleted!");
          }
        }
      );
    }
    return next(new AppError("User already exists!", 400));
  }

  const avatarImage = `userImages/${req.files.avatarImage[0].filename}`;
  const bannerImage = `userImages/${
    (req.files.bannerImage && req.files.bannerImage[0].filename) ||
    "default/banner.jpg"
  }`;

  const newUser = {
    name,
    email,
    password,
    avatarImage,
    bannerImage,
  };

  const activationToken = createJwtToken(newUser);

  const activationUrl = `http://localhost:3000/users/activation/${activationToken}`;

  await sendMail({
    email: newUser.email,
    subject: "Activate your asccount",
    message: `hello ${newUser.name}, please click on the link to activate your account: ${activationUrl}`,
  });

  res.status(201).json({
    success: true,
    message: `Please check your email: ${newUser.email} to activate your acccount`,
  });
});

// ** activating/verifying the created user
exports.activateUser = catchAsyncErrors(async (req, res, next) => {
  const { activation_token } = req.body;

  // ** if the token is expired, it will throw error and we catch it in the error middleware
  const decodedJwt = jwt.verify(activation_token, process.env.JWT_SECRET_KEY);

  const { name, email, password, avatarImage, bannerImage } = decodedJwt;

  const user = await User.findOne({ email });

  if (user) {
    return next(new AppError("Token has been used, please login", 400));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    avatarImage,
    bannerImage,
  });

  // ** remember is by default true
  sendToken(newUser, 201, res, true, "token");
});

// ** login a user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide all the fields", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("User doesn't exit, please sign up!", 400));
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(new AppError("Please provide correct information", 401));
  }

  sendToken(user, 200, res, rememberMe, "token");
});

// ** Logout user
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expiresIn: new Date(),
    httpOnly: true,
  });
  res.status(201).json({
    success: true,
    message: "User logged out successfully",
  });
});

// ** Get user

exports.getUser = catchAsyncErrors(async (req, res, next) => {
  const userOrders = await Order.find({ user: req.user._id });

  const user = req.user.toObject();
  user.orders = userOrders;

  res.status(200).json({
    success: true,
    body: user,
  });
});

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const { name, phoneNumber, currentPassword } = req.body;

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

  const isPasswordValid = await req.user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    return next(new AppError("Please provide correct password", 401));
  }

  req.user.name = name;
  req.user.phoneNumber = phoneNumber;
  const updatedUser = await req.user.save();

  res.status(200).json({
    success: true,
    body: updatedUser,
  });
});

exports.changeAvatarImage = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please provide new profile picture", 400));
  }
  const oldAvatartImage = req.user.avatarImage;

  fs.unlink(`uploads/${oldAvatartImage}`, (err) => {
    if (err) {
      console.log("old user image doesn't get deleted", err);
    } else {
      console.log("old user image has been deleted");
    }
  });

  const newAvatarImage = `userImages/${req.file.filename}`;
  req.user.avatarImage = newAvatarImage;
  const updatedUser = await req.user.save();

  res.status(200).json({
    success: true,
    body: updatedUser,
  });
});

exports.addAddress = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;

  if (!["Home", "Default", "Office"].includes(req.body.addressType)) {
    return next(new AppError("Address type is not supported", 400));
  }

  const addressIndex = user.addresses.findIndex(
    (address) => address.addressType === req.body.addressType
  );

  if (addressIndex === -1) {
    user.addresses.push(req.body);
  } else {
    user.addresses[addressIndex] = req.body;
  }

  const newUser = await user.save();

  res.status(201).json({
    success: true,
    body: newUser,
  });
});

exports.removeAddress = catchAsyncErrors(async (req, res, next) => {
  const newUser = await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $pull: {
        addresses: { _id: req.params.addressId },
      },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    body: newUser,
  });
});

exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword) {
    return next(new AppError("Please provide current password", 401));
  }
  const passwordIsCorrect = await req.user.comparePassword(currentPassword);
  if (!passwordIsCorrect) {
    return next(new AppError("Current Password is not correct", 401));
  }

  req.user.password = newPassword;
  await req.user.save();

  res.status(200).json({
    success: true,
    body: { message: "Password changed successfully" },
  });
});
