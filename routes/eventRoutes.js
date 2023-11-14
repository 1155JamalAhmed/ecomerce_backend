const express = require("express");
const { isShopAuthenticated } = require("../middlewares/auth");
const { upload } = require("../middlewares/multer");
const eventController = require("../controllers/eventController");
const router = express.Router();

router.route("/create-event").post(
  isShopAuthenticated,
  (req, res, next) => {
    req.imageDestination = "eventImages/";
    next();
  },
  upload.array("images", 3),
  eventController.createEvent
);

router
  .route("/get-all-events-shop/:id")
  .get(eventController.getAllEventsByShop);

router.route("/get-all-events").get(eventController.getAllEvents);
router.route("/popular-event").get(eventController.getPopularEvent);
router
  .route("/delete-event")
  .post(isShopAuthenticated, eventController.deleteEvent);

module.exports = router;
