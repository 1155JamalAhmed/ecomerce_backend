const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const AppError = require("../utils/appError");

exports.getMessagesByUserChat = catchAsyncErrors(async (req, res, next) => {
  const chat = await Chat.findOne({
    user: req.user._id,
    _id: req.params.chatId,
  });

  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  const messages = await Message.find({
    chat: chat._id,
  })
    .sort({ createdAt: -1 })
    .populate("sender");

  res.status(200).json({
    success: true,
    body: messages,
  });
});

exports.getMessagesByShopChat = catchAsyncErrors(async (req, res, next) => {
  const chat = await Chat.findOne({
    shop: req.shop._id,
    _id: req.params.chatId,
  });

  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  const messages = await Message.find({
    chat: chat._id,
  })
    .sort({ createdAt: -1 })
    .populate("sender");

  res.status(200).json({
    success: true,
    body: messages,
  });
});