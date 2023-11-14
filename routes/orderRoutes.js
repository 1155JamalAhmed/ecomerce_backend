const express = require("express");
const orderController = require("../controllers/orderController");
const { isAuthenticated, isShopAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router
  .route("/create-order")
  .post(isAuthenticated, orderController.createOrder);

router
  .route("/update-order-by-shop")
  .patch(isShopAuthenticated, orderController.updateOrderByShop);

module.exports = router;
