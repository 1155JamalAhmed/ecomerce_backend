const express = require("express");
const messageController = require("../controllers/messageController");
const { isAuthenticated, isShopAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router
  .route("/get-messages-by-user/:chatId")
  .get(isAuthenticated, messageController.getMessagesByUserChat);
router
  .route("/get-messages-by-shop/:chatId")
  .get(isShopAuthenticated, messageController.getMessagesByShopChat);

module.exports = router;
