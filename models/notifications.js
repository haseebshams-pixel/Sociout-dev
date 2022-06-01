const Joi = require("joi");
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  text: {
    type: String,
    min: 0,
    max: 255,
  },
  sender: {
    type: String,
    min: 0,
    max: 255,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    Default: Date.now,
  },
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports.Notification = Notification;
module.exports.NotificationSchema = NotificationSchema;
