const cron = require("node-cron");
const { EventExpiredHandler } = require("./eventScripts");

exports.cronSchedular = () => {
  // run task each day at 7AM at 0 minute
  cron.schedule("0 7 * * *", () => {
    EventExpiredHandler();
  });
};
