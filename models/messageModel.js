const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    // Reference to the sender, which can be a User or a Seller
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderType", // Reference path to determine the model type
    },
    // A field to specify the type of sender (User or Seller)
    senderType: {
      type: String,
      enum: ["User", "Shop"],
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", MessageSchema);
