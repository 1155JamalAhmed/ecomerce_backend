const Event = require("../models/eventModel");

exports.EventExpiredHandler = async () => {
  const currentDateTime = new Date();
  try {
    await Event.updateMany(
      {
        endDate: { $lt: currentDateTime },
        status: "Running",
      },
      { $set: { status: "Stop" } }
    );
    console.log("Updating status of events finished at", new Date());
  } catch (err) {
    console.log("err", err);
  }
};
