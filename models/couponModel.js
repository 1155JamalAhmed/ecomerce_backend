const mongoose = require("mongoose");
const dayjs = require("dayjs");
const AppError = require("../utils/appError");

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your coupon code"],
    unique: true,
  },
  disPercentage: {
    type: Number,
    min: 5,
    max: 80,
    required: [true, "Please enter discount percentage for coupon code"],
  },
  minAmount: {
    type: Number,
  },
  maxAmount: {
    type: Number,
    validate: {
      validator: function (maxAmount) {
        if (!this.minAmount || !maxAmount) {
          return true;
        }
        return maxAmount > this.minAmount;
      },
      message: "Please provide maximum amount greate than minimum Amount",
    },
  },
  startDate: {
    type: Date,
    required: [true, "a coupon code must have a start date"],
  },
  endDate: {
    type: Date,
    required: [true, "a coupon code must have a end date"],
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Coupon code must belong to some shop"],
    ref: "Shop",
  },
  createdAt: {
    type: Date,
    default: Date.now(), // time in milliseconds
  },
});

// When the endDate reaches the coupon will be deleted automatically
couponSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });

couponSchema.pre("save", function (next) {
  const startDateTime = dayjs(this.startDate);
  const endDateTime = dayjs(this.endDate);
  const currentDateTime = dayjs();

  // start date should greate than currentDateTime
  if (startDateTime < currentDateTime) {
    return next(new AppError("Start date should not be in past", 400));
  }
  // endDate should be greate than 1 day + start date
  if (endDateTime < startDateTime.add(1, "day")) {
    return next(
      new AppError("End date should be after 1 day of start date", 400)
    );
  }

  // minutes must be multiple of 5
  if (startDateTime.minute() % 5 !== 0 || endDateTime.minute() % 5 !== 0) {
    return next(
      new AppError("Start and end date must have minutes as a multiple of 5")
    );
  }

  next();
});

module.exports = mongoose.model("Coupon", couponSchema);
