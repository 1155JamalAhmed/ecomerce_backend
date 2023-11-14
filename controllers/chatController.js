const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Shop = require("../models/shopModel");
const Chat = require("../models/chatModel");
const AppError = require("../utils/appError");

exports.createChat = catchAsyncErrors(async (req, res, next) => {
  const { shopId } = req.body;

  if (!shopId) {
    return next(
      new AppError("Please provide shop to whom you want to chat", 400)
    );
  }

  const shop = await Shop.findById(shopId);

  if (!shop) {
    return next(new AppError("This shop no longer exists", 400));
  }

  const chat = await Chat.findOneAndUpdate(
    {
      user: req.user._id,
      shop: shopId,
    },
    {},
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  ).populate("shop");

  res.status(201).json({
    success: true,
    body: chat,
  });
});

exports.getAllChatsByUser = catchAsyncErrors(async (req, res, next) => {
  const chats = await Chat.find({
    user: req.user._id,
  })
    .sort({ updatedAt: -1 })
    .populate("shop latestMessage");

  res.status(201).json({
    success: true,
    body: chats,
  });
});
exports.getAllChatsByShop = catchAsyncErrors(async (req, res, next) => {
  const chats = await Chat.find({
    shop: req.shop._id,
  })
    .sort({ updatedAt: -1 })
    .populate("user latestMessage");

  res.status(201).json({
    success: true,
    body: chats,
  });
});
