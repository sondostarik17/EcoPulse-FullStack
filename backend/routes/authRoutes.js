
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  getCurrentUser,
  logoutUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// REGISTER
router.post("/register", (req, res, next) => {
  console.log("REGISTER ROUTE HIT");
  next();
}, registerUser);

// USER LOGIN
router.post("/login", loginUser);

// ADMIN LOGIN
router.post(
  "/admin/login",
  (req, res, next) => {
    req.expectedRole = "admin";
    next();
  },
  loginUser
);

// GOOGLE LOGIN
router.post("/google", googleLogin);

// CURRENT USER
router.get("/me", protect, getCurrentUser);

// LOGOUT
router.post("/logout", logoutUser);

console.log("AUTH ROUTES LOADED");

module.exports = router;
