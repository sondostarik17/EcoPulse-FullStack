
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ========================================
// PROTECT ROUTES
// Authenticate user using HttpOnly Cookie
// ========================================
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.ecopulse_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables.");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or account is inactive.",
      });
    }

    req.user = user;

    return next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired session.",
    });
  }
};

// ========================================
// ADMIN ONLY
// ========================================
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }

  return next();
};

module.exports = {
  protect,
  adminOnly,
};
