const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "Friend" }], // Friends list
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Friend" }], // Sent friend requests
  receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Friend" }] // Received friend requests
});

// Avoid overwriting the model
const Friend = mongoose.models.Friend || mongoose.model("Friend", friendSchema);

module.exports = Friend;
