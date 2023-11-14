const express = require("express");
const { isShopAuthenticated } = require("../middlewares/auth");
const { upload } = require("../middlewares/multer");
const productController = require("../controllers/productController");
const {
  ipToCountryFinder,
  ipFinder,
} = require("../middlewares/ipToCountryFinder");
const router = express.Router();

router.route("/create-product").post(
  isShopAuthenticated,
  (req, res, next) => {
    req.imageDestination = "productImages/";
    next();
  },
  upload.array("images", 3),
  productController.createProduct
);

router
  .route("/delete-product")
  .post(isShopAuthenticated, productController.deleteProduct);

router
  .route("/get-all-products-shop/:id")
  .get(productController.getAllProductsByShop);

router.route("/get-all-products").get(productController.getAllProducts);

router
  .route("/best-selling-products")
  .get(productController.getBestSellingProducts);

router
  .route("/featured-products")
  .get(ipFinder, ipToCountryFinder, productController.getFeaturedProduct);

router
  .route("/search-products-by-name")
  .get(productController.searchProductsByName);

router.route("/best-deals").get(productController.getBestDeals);

router.route("/:slug").get(productController.getProductDetail);

module.exports = router;
