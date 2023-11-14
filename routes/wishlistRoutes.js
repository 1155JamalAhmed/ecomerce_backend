const express = require("express");
const wishlistController = require("../controllers/wishlistController");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router
  .route("/")
  .get(isAuthenticated, wishlistController.getWishlist)
  .post(isAuthenticated, wishlistController.addItemToWishlist);

router
  .route("/wishlist-item-to-cart")
  .patch(isAuthenticated, wishlistController.wishlistItemToCart);

router
  .route("/:itemId")
  .delete(isAuthenticated, wishlistController.removeItemFromWishlist);

module.exports = router;
