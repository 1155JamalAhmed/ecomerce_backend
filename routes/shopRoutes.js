const express = require("express");
const { upload } = require("../middlewares/multer");
const shopController = require("../controllers/shopController");
const { isShopAuthenticated } = require("../middlewares/auth");
const router = express.Router();

router.post(
  "/create-shop",
  (req, res, next) => {
    req.imageDestination = "shopImages/";
    next();
  },
  upload.single("shopImage"),
  shopController.createShop
);

router.route("/change-avatarImage").patch(
  isShopAuthenticated,
  (req, res, next) => {
    req.imageDestination = "shopImages/";
    next();
  },
  upload.single("newAvatarImage"),
  shopController.changeAvatarImage
);

router
  .route("/update-shop-data")
  .patch(isShopAuthenticated, shopController.updateShop);

router.post("/activation", shopController.activateShop);
router.post("/login-shop", shopController.loginShop);
router.get("/get-shop-by-id/:id", shopController.getShopById);
router.get("/logout-shop", isShopAuthenticated, shopController.logoutShop);
router.get("/get-shop", isShopAuthenticated, shopController.getShop);
router.get(
  "/get-order-stats-of-6-month-by-shop",
  isShopAuthenticated,
  shopController.getOrderStatsOf6MonthByShop
);
router.get(
  "/get-orders-on-city-by-shop",
  isShopAuthenticated,
  shopController.getOrdersOnCityByShop
);
router
  .route("/change-password")
  .patch(isShopAuthenticated, shopController.changePassword);

module.exports = router;
