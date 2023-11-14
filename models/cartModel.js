const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
