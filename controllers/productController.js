const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Product = require("../models/productModel");
const Review = require("../models/reviewModel");
const AppError = require("../utils/appError");

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const productData = req.body;
  //   images url are set to the images field
  productData.images = req.files.map(
    (image) => `productImages/${image.filename}`
  );
  productData.shop = req.shop._id;

  const savedProduct = await (
    await Product.create(productData)
  ).populate("shop");

  res.status(201).json({
    status: "success",
    body: savedProduct,
  });
});

exports.getProductDetail = catchAsyncErrors(async (req, res, next) => {
  // find a document with the given slug and populate it with shop
  const product = await Product.findOne({ slug: req.params.slug }).populate(
    "shop"
  );

  if (!product) {
    return next(new AppError("This product doesn't exists", 404));
  }

  // find 5 related product to that product
  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .limit(5)
    .populate("shop");

  // Find reviews of that product
  const reviews = await Review.find({
    product: product._id,
  }).populate("user");

  // find totalProduct of the shop having this product
  const totalProductsByShop = await Product.countDocuments({
    shop: product.shop._id,
  });

  // find total reviews on the product shop
  const totalReviewsAggr = await Review.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $match: { "product.shop": product.shop._id },
    },
    {
      $count: "totalReviews",
    },
  ]);

  let totalReviews = 0;

  if (totalReviewsAggr.length > 0) {
    totalReviews = totalReviewsAggr[0].totalReviews;
  }

  // combine shop related detail together
  const shopDetail = {
    ...product.shop.toObject(),
    totalProducts: totalProductsByShop,
    totalReviews,
  };

  res.status(200).json({
    success: true,
    body: {
      ...product.toObject(),
      productReviews: reviews,
      shop: shopDetail,
      relatedProducts: relatedProducts,
    },
  });
});

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const deletedProduct = await Product.findOneAndDelete({
    _id: req.body.productId,
    shop: req.shop._id,
  });

  if (!deletedProduct) {
    return next(new AppError("Your shop doesn't has this product", 404));
  }

  deletedProduct.images.forEach((imgUrl) =>
    fs.unlink(`upload/${imgUrl}`, (err) => {
      if (err) {
        console.log("Error in deleting product images", err);
      } else {
        console.log("Product image has been deleted");
      }
    })
  );

  res.status(200).json({
    success: true,
    body: deletedProduct,
  });
});

exports.getAllProductsByShop = catchAsyncErrors(async (req, res, next) => {
  const allProducts = await Product.find({ shop: req.params.id }).populate(
    "shop"
  );
  res.status(200).json({
    success: true,
    body: allProducts,
  });
});

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = limit * (page - 1);
  const filterationObject = {};

  if (req.query.category) {
    filterationObject.category = req.query.category;
  }

  const allProducts = await Product.find(filterationObject)
    .sort({ sold_out: 1 })
    .skip(skip)
    .limit(limit)
    .populate("shop");

  const totalProductsLength = await Product.countDocuments(filterationObject);

  res.status(200).json({
    success: true,
    body: {
      products: allProducts,
      totalProductsCount: totalProductsLength,
    },
  });
});

exports.getFeaturedProduct = catchAsyncErrors(async (req, res, next) => {
  const featuredProducts = await Product.find({})
    .sort({ sold_out: -1 })
    .limit(5)
    .populate("shop");

  res.status(200).json({
    success: true,
    body: featuredProducts,
  });
});
exports.getBestDeals = catchAsyncErrors(async (req, res, next) => {
  const bestDeals = await Product.find({})
    .sort({ sold_out: -1 })
    .limit(5)
    .populate("shop");

  res.status(200).json({
    success: true,
    body: bestDeals,
  });
});

exports.getBestSellingProducts = catchAsyncErrors(async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = limit * (page - 1);

  const bestSellingProducts = await Product.find()
    .sort({ sold_out: 1 })
    .skip(skip)
    .limit(limit)
    .populate("shop");

  const totalProductsLength = await Product.countDocuments();

  res.status(200).json({
    success: true,
    body: {
      products: bestSellingProducts,
      totalProductsCount: totalProductsLength,
    },
  });
});

exports.searchProductsByName = catchAsyncErrors(async (req, res, next) => {
  const productName = req.query.productName;
  if (!productName) {
    return next(new AppError("Please provide product name to search", 400));
  }
  const searchedProducts = await Product.find(
    {
      $text: { $search: productName },
    },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });

  res.status(200).json({
    success: true,
    body: searchedProducts,
  });
});
