const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send OTP Email
const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    to: email,
    subject: "Verify your Email",
    text: `Your OTP code is ${otp}`,
  });
};

// ✅ Signup Route - Register User & Send OTP
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists. Please log in or resend OTP." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 mins
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
      verified: false,
    });

    await newUser.save();
    await sendOTPEmail(email, otp);

    return res.status(200).json({ message: "OTP sent to email. Verify to complete registration." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// ✅ Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "Email already verified. You can log in." });
    }

    const currentTime = Date.now();
    const cooldownTime = 30 * 1000; // 30 seconds

    // Check if the last OTP request was within the cooldown period
    if (user.lastOtpRequest && currentTime - user.lastOtpRequest < cooldownTime) {
      const remainingTime = Math.ceil((cooldownTime - (currentTime - user.lastOtpRequest)) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${remainingTime} seconds before requesting a new OTP.` 
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = currentTime + 10 * 60 * 1000; // OTP valid for 10 mins

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.lastOtpRequest = currentTime; // Store last OTP request time
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "New OTP sent to email. Verify to complete registration." });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// ✅ Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.verified || user.otp !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Login Route
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.verified) {
      return res.status(400).json({ message: "Invalid credentials or email not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// ✅ Forgot Password - Send OTP for Reset (With Cooldown)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const cooldownTime = 30 * 1000; // 30 seconds
    const currentTime = Date.now();

    // Check if the user requested OTP recently
    if (user.lastOtpRequest && currentTime - user.lastOtpRequest < cooldownTime) {
      const remainingTime = Math.ceil((cooldownTime - (currentTime - user.lastOtpRequest)) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${remainingTime} seconds before requesting a new OTP`
      });
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = currentTime + 10 * 60 * 1000; // OTP valid for 10 mins

    // Update user with new OTP and last request time
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.lastOtpRequest = currentTime;
    await user.save();

    // Send OTP Email
    await transporter.sendMail({
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP code is ${otp}`,
    });

    res.json({ message: "OTP sent to email. Use it to reset your password." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// ✅ Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
