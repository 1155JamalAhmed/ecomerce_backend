const multer = require("multer");
const AppError = require("../utils/appError");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `uploads/${req.imageDestination}`);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split(".")[0];
    cb(null, filename + "-" + uniqueSuffix + ".png");
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only image!", 400), false);
  }
};

exports.upload = multer({ storage: storage, fileFilter: multerFilter });

// ** the file object looks like this
// file {
//   fieldname: 'file',
//   originalname: 'asan ji personal image.jpg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg'
// }
