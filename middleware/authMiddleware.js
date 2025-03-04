const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Friend = require("../models/friend"); // Ensure correct model import

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]; // Extract token
    }

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    console.log("✅ Token received:", token);

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.id) {
      console.log("❌ Invalid token payload:", decoded);
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    console.log("🔍 Decoded User ID:", decoded.id);

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      console.log("❌ Invalid MongoDB ID:", decoded.id);
      return res.status(401).json({ message: "Unauthorized: Invalid User ID" });
    }

    // Find user by ID
    const user = await Friend.findById(decoded.id).select("-password");
    
    if (!user) {
      console.log("❌ User not found in DB for ID:", decoded.id);
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    console.log("✅ Authenticated User:", user.username);

    req.user = user; // Attach user to request
    next(); // Continue to next middleware

  } catch (error) {
    console.error("🔥 Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Token verification failed", error: error.message });
  }
};
