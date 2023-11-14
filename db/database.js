const mongoose = require("mongoose");

let connectionUrl;
if (process.env.NODE_ENV === "PRODUCTION") {
  connectionUrl = process.env.DB_URL_PRODUCTION.replace(
    "<password>",
    process.env.DB_PASSWORD
  );
} else if (
  process.env.NODE_ENV === "DEVELOPMENT"
) {
  connectionUrl = process.env.DB_URL_DEVELOPMENT;
}

const connectDatabase = () => {
  mongoose
    .connect(connectionUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(
        "Connected to mongodb server: ",
        `${data.connection.host}:${data.connection.port}`
      );
    })
    .catch((err) => {
      console.log("Mongodb connection failed! Error: ", err.message);
    });
};

module.exports = connectDatabase;
