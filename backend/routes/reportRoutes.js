
const express = require("express");
const router = express.Router();

const {
  createReport,
  getMyReports,
  getReportById,
  getReportImage,
  deleteReport,
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public image route
router.get("/image/:fileId", getReportImage);

// All routes below require authentication
router.use(protect);

// Create report
router.post("/", upload.single("image"), createReport);

// Get logged-in user's reports
router.get("/my-reports", getMyReports);

// Delete report
router.delete("/:id", (req, res, next) => {
  console.log("DELETE ROUTE REACHED:", req.params.id);
  next();
}, deleteReport);

// Get one report
router.get("/:id", getReportById);

module.exports = router;