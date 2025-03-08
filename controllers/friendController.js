const Friend = require("../models/friend");
const User = require("../models/User");

// ✅ 1. Find a Friend by Username
exports.findFriend = async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`🔍 Searching for user with username: ${username}`);

    // Find the user in the database
    const user = await Friend.findOne({ username });

    if (!user) {
      console.log("❌ User not found in the database");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User found:", user);
    return res.json({ user });
  } catch (error) {
    console.error("🚨 Error finding friend:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ✅ 2. Send Friend Request
exports.sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id; // Extracted from token (middleware should set req.user)
    const { receiverUsername } = req.body;

    console.log(`📩 Friend request from sender ID: ${senderId} to ${receiverUsername}`);

    if (!receiverUsername) {
      console.log("❌ Receiver username missing in request body");
      return res.status(400).json({ message: "Receiver username is required" });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findOne({ name: receiverUsername });

    if (!sender) {
      console.log("❌ Sender not found in database");
      return res.status(404).json({ message: "Sender not found" });
    }

    if (!receiver) {
      console.log(`❌ Receiver ${receiverUsername} not found in database`);
      return res.status(404).json({ message: `Receiver ${receiverUsername} not found` });
    }

    // Check if already sent
    if (receiver.receivedRequests.includes(sender._id)) {
      console.log("⚠️ Friend request already sent");
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Update friend request lists
    receiver.receivedRequests.push(sender._id);
    sender.sentRequests.push(receiver._id);

    await receiver.save();
    await sender.save();

    console.log("✅ Friend request sent successfully!");
    res.json({ message: "Friend request sent successfully!" });
  } catch (error) {
    console.error("🚨 Error sending friend request:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ 3. Accept Friend Request
exports.acceptFriendRequest = async (req, res) => {
  try {
    console.log("📩 Accepting friend request...");
    console.log("📌 Request Headers:", req.headers);
    console.log("📌 Request Body:", req.body);
    console.log("👤 Authenticated User:", req.user);

    const { senderUsername } = req.body;

    if (!req.user || !req.user.name) {
      console.log("❌ Unauthorized: User not found in request");
      return res.status(401).json({ message: "Unauthorized: User not found in request" });
    }

    const receiverUsername = req.user.name; // Logged-in user

    if (!senderUsername || !receiverUsername) {
      console.log("❌ senderUsername or receiverUsername is missing");
      return res.status(400).json({ message: "Sender and receiver usernames are required" });
    }

    console.log(`📌 Sender: ${senderUsername}, Receiver: ${receiverUsername}`);

    const sender = await Friend.findOne({ name: senderUsername });
    const receiver = await Friend.findOne({ name: receiverUsername });

    if (!sender || !receiver) {
      console.log("❌ Sender or receiver not found in the database");
      return res.status(404).json({ message: "Sender or receiver not found" });
    }

    const senderId = sender._id.toString();
    const receiverId = receiver._id.toString();

    console.log(`🔍 Sender ID: ${senderId}, Receiver ID: ${receiverId}`);

    if (!receiver.receivedRequests.includes(senderId)) {
      console.log("❌ No friend request found from this user");
      return res.status(400).json({ message: "No friend request from this user" });
    }

    // Remove from received and sent requests
    receiver.receivedRequests = receiver.receivedRequests.filter(id => id.toString() !== senderId);
    sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId);

    // Add to friends list
    receiver.friends.push(sender._id);
    sender.friends.push(receiver._id);

    await receiver.save();
    await sender.save();

    console.log("✅ Friend request accepted successfully!");
    return res.json({ message: "Friend request accepted successfully!" });
  } catch (error) {
    console.error("🚨 Error accepting friend request:", error);
    return res.status(500).json({ error: error.message });
  }
};
