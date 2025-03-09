const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {type:String, unique:true},
  email: { type: String, unique: true },
  password: String,
  otp: String,
  otpExpiry: Date,
  lastOtpRequest: { type: Date, default: null },

  verified: { type: Boolean, default: false },

  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }], // Friends list
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }], // Sent friend requests
  receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }] // Received friend requests
});

module.exports = mongoose.model("User", userSchema);
