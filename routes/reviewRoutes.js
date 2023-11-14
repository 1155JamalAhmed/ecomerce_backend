const express = require("express");
const { isAuthenticated } = require("../middlewares/auth");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router
  .route("/write-review-on-product")
  .post(isAuthenticated, reviewController.writeReviewOnProduct);

router
  .route("/get-reviews-by-shop/:shopId")
  .get(reviewController.getReviewsByShop);

router
  .route("/get-reviews-by-order/:orderId")
  .get(isAuthenticated, reviewController.getReviewsByOrder);

module.exports = router;
