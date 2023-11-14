const express = require("express");
const cartController = require("../controllers/cartController");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router
  .route("/")
  .get(isAuthenticated, cartController.getCartByUser)
  .post(isAuthenticated, cartController.addItemToCart);
router
  .route("/delete-cart-by-user")
  .delete(isAuthenticated, cartController.deleteCartByUser);

router
  .route("/:cartItemId")
  .delete(isAuthenticated, cartController.deleteItemFromCart);

router
  .route("/incrementCartItem")
  .patch(isAuthenticated, cartController.incrementQuantityByOne);
router
  .route("/decrementCartItem")
  .patch(isAuthenticated, cartController.decrementQuantityByOne);

module.exports = router;
