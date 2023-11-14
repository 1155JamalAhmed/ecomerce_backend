const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Cart item should be a product"],
    ref: "Product",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Cart item should belongs to a user"],
    ref: "User",
  },
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
