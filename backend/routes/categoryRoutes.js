
const express = require("express");
const router = express.Router();

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/awarenessCategoryController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public: view categories
router.get("/", getCategories);

// Admin only: manage categories
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
