const express = require("express");
const router = express.Router();

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getAllReports,
  updateReportStatus,
  getDashboardStats,
  getAllUsers,
} = require("../controllers/adminController");

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardStats);
router.get("/reports", getAllReports);
router.patch("/reports/:id/status", updateReportStatus);
router.get("/users", getAllUsers);

module.exports = router;
