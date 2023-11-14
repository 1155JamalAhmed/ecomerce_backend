const express = require("express");
const paymentController = require("../controllers/paymentController");
const { isAuthenticated } = require("../middlewares/auth");
const router = express.Router();

router.post(
  "/create-intent",
  isAuthenticated,
  paymentController.createPaymentIntent
);

module.exports = router;
