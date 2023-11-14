const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email address"],
    unique: true,
  },
  phoneNumber: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
  },
  addresses: {
    type: [
      {
        country: {
          type: String,
          required: [true, "An address must have country"],
        },
        state: {
          type: String,
          required: [true, "An address must have state"],
        },
        city: {
          type: String,
        },

        fullAddress: {
          type: String,
          required: [true, "Please provide full address"],
        },
        zipCode: {
          type: Number,
          required: [true, "Address must contain area zip code"],
        },
        addressType: {
          type: String,
          enum: ["Default", "Home", "Office"],
          required: [true, "Please tag the address by type"],
        },
      },
    ],
    default: [],
  },
  role: {
    type: String,
    default: "User",
  },
  avatarImage: {
    type: String,
    required: true,
  },
  bannerImage: {
    type: String,
    default: "default/banner.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
userSchema.methods.getJwtToken = function (expiresIn) {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: expiresIn,
  });
};

// comapre password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
