const mongoose = require("mongoose");
const dayjs = require("dayjs");
const AppError = require("../utils/appError");

const CATEGORIES = [
  "Computers and Laptops",
  "cosmetics and body care",
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

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your event product name"],
  },
  description: {
    type: String,
    required: [true, "Please enter your event product description"],
  },
  category: {
    type: String,
    required: [true, "Please select category from the list"],
    enum: CATEGORIES,
  },
  startDate: {
    type: Date,
    required: [true, "Please specify the event start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please specify the event end date"],
  },
  status: {
    type: String,
    default: "Running",
  },
  tags: {
    type: String,
  },
  originalPrice: {
    type: Number,
  },
  discountPrice: {
    type: Number,
    required: [true, "Please enter your event product discount price"],
    validate: {
      validator: function (discountedPrice) {
        if (!this.originalPrice) {
          return true;
        }
        return discountedPrice < this.originalPrice;
      },
      message: "Please provide discount price less than original price",
    },
  },
  stock: {
    type: Number,
    required: [true, "Please enter your event product stock"],
  },
  images: {
    type: [String],
    validate: [imagesArrayMinLength, "Please select at least one image"],
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please specify shop of the event product"],
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
});

eventSchema.pre("save", function (next) {
  const startDateTime = dayjs(this.startDate);
  const endDateTime = dayjs(this.endDate);
  const currentDateTime = dayjs();

  // start date should greate than currentDateTime
  if (startDateTime < currentDateTime) {
    return next(new AppError("Start date should not be in past", 400));
  }
  // endDate should be greate than 3 days + start date
  if (endDateTime < startDateTime.add(3, "day")) {
    return next(
      new AppError("End date should be after 3 days of start date", 400)
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

module.exports = mongoose.model("Event", eventSchema);
