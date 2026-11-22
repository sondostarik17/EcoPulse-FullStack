
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const COOKIE_NAME = "ecopulse_token";

// 30 Days
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

// Cookie settings
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: COOKIE_MAX_AGE,
});

// Create authentication session
const createAuthSession = (res, userId) => {
  const token = generateToken(userId);

  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

// Safe user data
const getSafeUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone || "",
  profileImage: user.profileImage || "",
  role: user.role,
});

// ========================================
// REGISTER USER
// ========================================
const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration data",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: typeof phone === "string" ? phone.trim() : "",
      role: "user",
    });

    createAuthSession(res, user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    next(error);
  }
};

// ========================================
// LOGIN WITH EMAIL
// ========================================
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    if (!user || !user.isActive || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (req.expectedRole && user.role !== req.expectedRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin account required.",
      });
    }

    createAuthSession(res, user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: getSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GOOGLE LOGIN
// ========================================
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: "Google login is not configured",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googleData = ticket.getPayload();

    if (
      !googleData ||
      !googleData.email ||
      googleData.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: "Google account could not be verified",
      });
    }

    const email = googleData.email.toLowerCase();
    const googleId = googleData.sub;

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user && user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Please use the admin login page",
      });
    }

    if (user) {
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "This account is disabled",
        });
      }

      if (user.googleId && user.googleId !== googleId) {
        return res.status(409).json({
          success: false,
          message: "This email is linked to another Google account",
        });
      }

      user.googleId = googleId;

      if (!user.profileImage && googleData.picture) {
        user.profileImage = googleData.picture;
      }

      await user.save();
    } else {
      const nameParts = (googleData.name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      user = await User.create({
        firstName: googleData.given_name || nameParts[0] || "Google",
        lastName:
          googleData.family_name ||
          nameParts.slice(1).join(" ") ||
          "User",
        email,
        googleId,
        profileImage: googleData.picture || "",
        role: "user",
      });
    }

    createAuthSession(res, user._id);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error("Google login error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

// ========================================
// GET CURRENT LOGGED-IN USER
// ========================================
const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: getSafeUser(req.user),
  });
};

// ========================================
// LOGOUT
// ========================================
const logoutUser = (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// ========================================
// EXPORT CONTROLLERS
// ========================================
module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getCurrentUser,
  logoutUser,
};
