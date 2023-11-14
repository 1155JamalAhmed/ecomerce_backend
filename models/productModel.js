const mongoose = require("mongoose");
const slugify = require("slugify");

const CATEGORIES = [
  "Computers and Laptops",
  "Accesories",
  "Cloths",
  "Shoes",
  "Gifts",
  "Pet Care",
  "Mobile and Tablets",
  "Music and Gaming",
  "Others",
];
const imagesArrayMinLength = (value) => {
  // false means array is empty
  return value.length > 0;
};

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your product name"],
    unique: true,
    trim: true,
    maxlength: [40, "A product name should not be greater than 40 characters"],
    minlength: [10, "A product name should have minimum 10 characters"],
  },
  description: {
    type: String,
    required: [true, "Please enter your product description"],
  },
  category: {
    type: String,
    required: [true, "Please select category from the list"],
    enum: CATEGORIES,
  },
  tags: {
    type: String,
  },
  originalPrice: {
    type: Number,
  },
  discountPrice: {
    type: Number,
    required: [true, "Please enter your product discount price"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter your product stock"],
  },
  images: {
    type: [String],
    validate: [imagesArrayMinLength, "Please select at least one image"],
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    require: [true, "Please specify shop of the product"],
    ref: "Shop",
  },
  sold_out: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(), // time in milliseconds
  },
  slug: {
    type: String,
    unique: true,
  },
  avgRating: {
    type: Number,
    default: 2.5,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
    set: function customRoundRating(rating) {
      if (rating < 1) {
        return 1;
      } else if (rating > 5) {
        return 5;
      } else {
        return Math.round(rating * 2) / 2;
      }
    },
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
});

productSchema.index({ name: "text" });

productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model("Product", productSchema);
