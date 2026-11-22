
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const OTPVerification = require("../models/OTPVerification");

// Email configuration
const smtpPort = Number(process.env.SMTP_PORT || 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s/g, ""),
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

// @desc Send OTP
// @route POST /api/otp/send
// @access Public
const sendOTP = async (req, res) => {
  let savedOTP = null;

  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check SMTP configuration
    if (
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_HOST
    ) {
      throw new Error("SMTP environment variables are missing");
    }

    // Test Gmail connection
    await transporter.verify();

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before saving
    const codeHash = await bcrypt.hash(otp, 10);

    // OTP expires after 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Remove previous OTP
    await OTPVerification.deleteMany({ email });

    // Save new OTP
    savedOTP = await OTPVerification.create({
      email,
      codeHash,
      expiresAt,
      attempts: 0,
    });

    // Send email
    await transporter.sendMail({
      from: `"EcoPulse" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "EcoPulse Email Verification",
      text: `Your EcoPulse verification code is ${otp}. It expires in 5 minutes.`,
    });

    console.log("OTP email sent successfully");

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
    });

  } catch (error) {
    console.error("Send OTP Error:", {
      message: error.message,
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
      response: error.response,
    });

    // Delete OTP if sending failed
    if (savedOTP) {
      await OTPVerification.deleteOne({ _id: savedOTP._id });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to send verification code",
    });
  }
};

// @desc Verify OTP
// @route POST /api/otp/verify
// @access Public
const verifyOTP = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    const verification = await OTPVerification.findOne({
      email,
      verifiedAt: null,
    }).select("+codeHash");

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "No active verification code found",
      });
    }

    if (verification.expiresAt < new Date()) {
      await verification.deleteOne();

      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    if (verification.attempts >= 5) {
      await verification.deleteOne();

      return res.status(429).json({
        success: false,
        message: "Too many attempts. Request a new code.",
      });
    }

    verification.attempts += 1;
    await verification.save();

    const isMatch = await bcrypt.compare(
      String(otp),
      verification.codeHash
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect verification code",
      });
    }

    verification.verifiedAt = new Date();
    await verification.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("Verify OTP Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};
