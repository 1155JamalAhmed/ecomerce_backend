const catchAsyncErrors = require("../utils/catchAsyncErrors");
const Event = require("../models/eventModel");
const AppError = require("../utils/appError");
const fs = require("fs");

exports.createEvent = catchAsyncErrors(async (req, res, next) => {
  const eventData = req.body;

  if (eventData.startDate === "null" || eventData.endDate === "null") {
    return next(
      new AppError("Please provide start and end date of the event", 400)
    );
  }
  //   images url are set to the images field
  eventData.images = req.files.map((image) => `eventImages/${image.filename}`);
  eventData.shop = req.shop._id;

  const savedEvent = await (await Event.create(eventData)).populate("shop");

  res.status(201).json({
    status: "success",
    body: savedEvent,
  });
});

exports.getAllEventsByShop = catchAsyncErrors(async (req, res, next) => {
  const allEvents = await Event.find({ shop: req.params.id }).populate("shop");
  res.status(200).json({
    success: true,
    body: allEvents,
  });
});

exports.deleteEvent = catchAsyncErrors(async (req, res, next) => {
  const deleteEvent = await Event.findOneAndDelete({
    _id: req.body.eventId,
    shop: req.shop._id,
  });

  if (!deleteEvent) {
    return next(new AppError("Your shop doesn't has this event", 404));
  }

  deleteEvent.images.forEach((imgUrl) =>
    fs.unlink(`uploads/${imgUrl}`, (err) => {
      if (err) {
        console.log("Error in deleting event images", err);
      } else {
        console.log("Event image has been deleted");
      }
    })
  );

  res.status(200).json({
    success: true,
    body: deleteEvent,
  });
});

exports.getAllEvents = catchAsyncErrors(async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = limit * (page - 1);

  const allEvents = await Event.find({
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  })
    .skip(skip)
    .limit(limit)
    .populate("shop");

  const totalEventsLength = await Event.countDocuments({
    startDate: { $lte: Date() },
    endDate: { $gte: new Date() },
  });

  res.status(200).json({
    success: true,
    body: {
      events: allEvents,
      totalEventsCount: totalEventsLength,
    },
  });
});

exports.getPopularEvent = catchAsyncErrors(async (req, res, next) => {
  // ** select only where startDate is lte right now
  // ** take the difference of original and discount price => and findd diff in percentage
  // ** sort with higher sold_out, diff
  // ** select the top most event

  const popularEvent = await Event.aggregate([
    {
      $match: {
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      },
    },
    {
      $addFields: {
        priceDiffPer: {
          $round: [
            {
              $divide: [
                {
                  $multiply: [
                    { $subtract: ["$originalPrice", "$discountPrice"] },
                    100,
                  ],
                },
                "$originalPrice",
              ],
            },
            2,
          ],
        },
      },
    },
    {
      $sort: { sold_out: -1, priceDisPer: -1 },
    },
    {
      $limit: 1,
    },
  ]);

  res.status(200).json({
    success: true,
    body: popularEvent[0],
  });
});
