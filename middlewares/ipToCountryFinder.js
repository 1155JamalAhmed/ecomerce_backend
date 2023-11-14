const { IPinfoWrapper } = require("node-ipinfo");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const requestIp = require("request-ip");

const ipinfo = new IPinfoWrapper(process.env.IP_INFO_TOKEN);

exports.ipFinder = catchAsyncErrors(async (req, res, next) => {
  req.clientIp = requestIp.getClientIp(req);
  next();
});

exports.ipToCountryFinder = catchAsyncErrors(async (req, res, next) => {
  ipinfo.lookupIp(req.clientIp).then((response) => {
    console.log(response);
  });
  next();
});
