const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "An order must belong to a user"],
    ref: "User",
  },
  totalAmount: {
    type: Number,
    required: [true, "Provide total amount of the order"],
  },
  couponApplied: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
  },
  discountedPrice: {
    type: Number,
  },
  shippingAddress: {
    type: Object,
    required: [true, "Please provide shipping address"],
    fullName: {
      type: String,
      required: [true, "Please provide your full name"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide your phone number"],
    },
    zipcode: {
      type: String,
      required: [true, "Please provide your zip code"],
    },
    country: {
      type: String,
      required: [true, "please provide your country"],
    },
    state: {
      type: String,
      required: [true, "please provide your state"],
    },
    city: {
      type: String,
    },
    fullAddress: {
      type: String,
      required: [true, "please provide your full address"],
    },
  },
  cart: [
    {
      type: Object,
      required: [true, "Please provide cart"],
    },
  ],
  status: {
    type: String,
    default: "Processing",
  },
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
    paymentType: {
      type: String,
    },
  },
  placedOn: {
    type: Date,
    default: new Date(),
  },
  deliveredAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Order", orderSchema);
