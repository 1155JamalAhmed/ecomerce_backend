const mongoose = require("mongoose");
const Product = require("./productModel");
const Shop = require("./shopModel");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Review must belong to a user"],
    ref: "User",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Review must belong to a product"],
    ref: "Product",
  },
  rating: {
    type: Number,
    required: [true, "Please Provide rating for review"],
    min: 0,
    max: 5,
  },
  review: {
    type: String,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Review must belong to an order"],
    ref: "Order",
  },
  createdOn: {
    type: Date,
    default: new Date(),
  },
});

reviewSchema.statics.calcAverageRatings = async function (review) {
  const productStats = await this.aggregate([
    {
      $match: { product: review.product },
    },
    {
      $group: {
        _id: "$product",
        noOfReviews: { $sum: 1 },
        avgRatings: { $avg: "$rating" },
      },
    },
  ]);

  if (productStats.length > 0) {
    await Product.findByIdAndUpdate(review.product, {
      avgRating: productStats[0].avgRatings,
      ratingsQuantity: productStats[0].noOfReviews,
    });
  }

  const product = await Product.findById(review.product);

  const shopStats = await Product.aggregate([
    {
      $match: { shop: product.shop },
    },
    {
      $group: {
        _id: "$shop",
        shopAvgRating: { $avg: "$avgRating" },
      },
    },
  ]);
  if (shopStats.length > 0) {
    await Shop.findByIdAndUpdate(product.shop, {
      avgRating: shopStats[0].shopAvgRating,
    });
  }
};

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // ** first we took the review by findOne
  // ** then we placed it on this.review to get it in the post hook
  this.clonedQuery = this.clone();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  this.review = await this.clonedQuery.findOne();
  await this.review.constructor.calcAverageRatings(this.review);
});
module.exports = mongoose.model("Review", reviewSchema);
