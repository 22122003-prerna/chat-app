const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  otp: String,
  otpExpiry: Date,
  lastOtpRequest: { type: Date, default: null },

  verified: { type: Boolean, default: false },

  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "Friend", default: [] }], // Friends list
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Friend", default: [] }], // Sent friend requests
  receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Friend", default: [] }] // Received friend requests
});

module.exports = mongoose.model("User", userSchema);
