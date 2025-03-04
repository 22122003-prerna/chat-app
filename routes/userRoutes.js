const express = require("express");
const { signup, verifyOTP, login, forgotPassword, resetPassword, resendOTP } = require("../controllers/userController");
const { findFriend, sendFriendRequest, acceptFriendRequest } = require("../controllers/friendController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/find/:username", findFriend);
router.post("/send-request", protect, sendFriendRequest);
router.post("/accept-request", protect, acceptFriendRequest);


module.exports = router;
