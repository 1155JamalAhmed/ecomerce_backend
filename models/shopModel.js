const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const shopSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please enter your shop email address"],
  },
  name: {
    type: String,
    required: [true, "Please enter your shop name"],
  },
  phone: {
    type: Number,
    required: [true, "Please enter your shop phone number"],
  },
  role: {
    type: String,
    default: "Seller",
  },
  address: {
    type: String,
    required: [true, "Please provide shop address"],
  },
  zipCode: {
    type: Number,
    required: [true, "please provide zipCode"],
  },
  password: {
    type: String,
    required: [true, "Please enter your shop password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
  },
  description: {
    type: String,
  },
  avatarImage: {
    type: String,
    required: [true, "Please provide an image for your shop"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
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
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Hash password
shopSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
shopSchema.methods.getJwtToken = function (expiresIn) {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: expiresIn,
  });
};

// comapre password
shopSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Shop", shopSchema);
