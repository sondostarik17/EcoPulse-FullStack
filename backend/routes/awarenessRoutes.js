const express = require("express");

const router = express.Router();

const {
  getPublishedArticles,
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/awarenessController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Public: Get published articles
router.get("/", getPublishedArticles);

// Admin: Get all articles
router.get("/admin", protect, adminOnly, getAllArticles);

// Admin: Create article
router.post("/", protect, adminOnly, createArticle);

// Admin: Update article
router.put("/:id", protect, adminOnly, updateArticle);

// Admin: Delete article
router.delete("/:id", protect, adminOnly, deleteArticle);

module.exports = router;