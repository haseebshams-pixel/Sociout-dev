const mongoose = require("mongoose");
const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otpgenerated: {
    type: String,
    required: true,
  },
});

const Otp = mongoose.model("Otp", OtpSchema);

module.exports.Otp = Otp;
module.exports.OtpSchema = OtpSchema;
