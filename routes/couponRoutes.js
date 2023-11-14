const express = require("express");
const { isShopAuthenticated, isAuthenticated } = require("../middlewares/auth");
const couponController = require("../controllers/couponController");
const router = express.Router();

router
  .route("/create-coupon")
  .post(isShopAuthenticated, couponController.createCoupon);

router
  .route("/get-all-coupons-shop/:id")
  .get(couponController.getAllCouponByShop);

router
  .route("/delete-coupon")
  .post(isShopAuthenticated, couponController.deleteCoupon);

router.get(
  "/get-discount-by-coupon-code/:couponCode",
  isAuthenticated,
  couponController.getDiscountByCouponCode
);

module.exports = router;
