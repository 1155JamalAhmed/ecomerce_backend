const jwt = require("jsonwebtoken");

exports.createJwtToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "5m",
  });
};
