const express = require("express");
const { signup, verifyOTP, login, forgotPassword, resetPassword, resendOTP } = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
