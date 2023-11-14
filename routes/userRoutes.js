const express = require("express");
const userController = require("../controllers/userController");
const { upload } = require("../middlewares/multer");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

const allowedImages = [
  { name: "avatarImage", maxCount: 1 },
  { name: "bannerImage", maxCount: 1 },
];

// Sign-up send the link to appropriate email
router.route("/create-user").post(
  (req, res, next) => {
    req.imageDestination = "userImages/";
    next();
  },
  upload.fields(allowedImages),
  userController.createUser
);

router.route("/change-avatarImage").patch(
  isAuthenticated,
  (req, res, next) => {
    req.imageDestination = "userImages/";
    next();
  },
  upload.single("newAvatarImage"),
  userController.changeAvatarImage
);

// that link from email should activate the user
router.route("/activation").post(userController.activateUser);

// login user
router.route("/login-user").post(userController.loginUser);

// logout user
router.route("/logout-user").get(isAuthenticated, userController.logoutUser);

// get user from the cookie and then send the user back
router.route("/get-user").get(isAuthenticated, userController.getUser);

router
  .route("/update-user-data")
  .patch(isAuthenticated, userController.updateUser);

router
  .route("/add-user-address")
  .patch(isAuthenticated, userController.addAddress);
router
  .route("/delete-user-address/:addressId")
  .delete(isAuthenticated, userController.removeAddress);

router
  .route("/change-password")
  .patch(isAuthenticated, userController.changePassword);
module.exports = router;
