const express = require("express");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use("/", express.static("uploads"));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10kb",
  })
);

// app.use(
//   express.urlencoded({
//     extended: true,
//     limit: "10kb",
//   })
// );

app.use(cookieParser());

// ** CONFIG
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "config/.env",
  });
  app.use(morgan("dev"));
}

// import routes
const userRoutes = require("./routes/userRoutes");
const shopRoutes = require("./routes/shopRoutes");
const productRoutes = require("./routes/productRoutes");
const eventRoutes = require("./routes/eventRoutes");
const couponRoutes = require("./routes/couponRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const AppError = require("./utils/appError");

app.use("/api/v2/users", userRoutes);
app.use("/api/v2/shops", shopRoutes);
app.use("/api/v2/products", productRoutes);
app.use("/api/v2/events", eventRoutes);
app.use("/api/v2/coupons", couponRoutes);
app.use("/api/v2/carts", cartRoutes);
app.use("/api/v2/wishlists", wishlistRoutes);
app.use("/api/v2/payments", paymentRoutes);
app.use("/api/v2/orders", orderRoutes);
app.use("/api/v2/reviews", reviewRoutes);
app.use("/api/v2/chats", chatRoutes);
app.use("/api/v2/messages", messageRoutes);

// ** all other routes than the defined above will lead to this error route
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ** GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
