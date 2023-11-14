const express = require("express");
const chatController = require("../controllers/chatController.js");
const {
  isAuthenticated,
  isShopAuthenticated,
} = require("../middlewares/auth.js");

const router = express.Router();

router.post("/create-chat", isAuthenticated, chatController.createChat);
router.get(
  "/get-chats-by-user",
  isAuthenticated,
  chatController.getAllChatsByUser
);
router.get(
  "/get-chats-by-shop",
  isShopAuthenticated,
  chatController.getAllChatsByShop
);

module.exports = router;
