const express = require("express");

const router = express.Router();

const {
  sendOTP,
  verifyOTP,
} = require("../controllers/otpController");

// Send verification code
router.post("/send", sendOTP);

// Verify verification code
router.post("/verify", verifyOTP);

module.exports = router;