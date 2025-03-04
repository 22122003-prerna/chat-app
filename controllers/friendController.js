const mongoose = require("mongoose");
const Friend = require("../models/Friend");

// ✅ 1. Find a Friend by Username
exports.findFriend = async (req, res) => {
  try {
    const { username } = req.params;

    // Find the user in the database
    const user = await Friend.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Error finding friend:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ✅ 2. Send Friend Request


exports.sendFriendRequest = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Debugging

    const { senderUsername, receiverUsername } = req.body;

    if (!senderUsername || !receiverUsername) {
      return res.status(400).json({ message: "Both sender and receiver usernames are required" });
    }

    const sender = await Friend.findOne({ username: senderUsername });
    const receiver = await Friend.findOne({ username: receiverUsername });

    if (!sender) {
      return res.status(404).json({ message: `Sender ${senderUsername} not found` });
    }

    if (!receiver) {
      return res.status(404).json({ message: `Receiver ${receiverUsername} not found` });
    }

    // Check if request already exists
    if (receiver.receivedRequests.includes(sender._id)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Update sender & receiver
    receiver.receivedRequests.push(sender._id);
    sender.sentRequests.push(receiver._id);

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request sent successfully!" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: error.message });
  }
};

// accept friend request
exports.acceptFriendRequest = async (req, res) => {
  try {
    console.log("Request Headers:", req.headers);
    console.log("Request Body:", req.body);
    console.log("Authenticated User:", req.user);

    const { senderUsername } = req.body;
    
    if (!req.user || !req.user.username) {
      return res.status(401).json({ message: "Unauthorized: User not found in request" });
    }

    const receiverUsername = req.user.username; // Logged-in user

    if (!senderUsername || !receiverUsername) {
      console.log("Error: senderUsername or receiverUsername is missing");
      return res.status(400).json({ message: "Sender and receiver usernames are required" });
    }

    console.log(`Sender: ${senderUsername}, Receiver: ${receiverUsername}`);

    const sender = await Friend.findOne({ username: senderUsername });
    const receiver = await Friend.findOne({ username: receiverUsername });

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or receiver not found" });
    }

    const senderId = sender._id.toString();
    const receiverId = receiver._id.toString();

    if (!receiver.receivedRequests.includes(senderId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }

    receiver.receivedRequests = receiver.receivedRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId);

    receiver.friends.push(sender._id);
    sender.friends.push(receiver._id);

    await receiver.save();
    await sender.save();

    return res.json({ message: "Friend request accepted successfully!" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({ error: error.message });
  }
};
