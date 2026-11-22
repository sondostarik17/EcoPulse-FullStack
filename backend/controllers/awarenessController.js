const mongoose = require("mongoose");

const AwarenessArticle = require("../models/AwarenessArticle");
const AdminActivityLog = require("../models/AdminActivityLog");

// @desc    Get published articles
// @route   GET /api/awareness
// @access  Public
const getPublishedArticles = async (req, res) => {
  try {
    const articles = await AwarenessArticle.find({
      status: "Published",
    })
      .populate("categoryId", "name")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error("Get Articles Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get articles",
    });
  }
};

// @desc    Get all articles for admin
// @route   GET /api/awareness/admin
// @access  Admin
const getAllArticles = async (req, res) => {
  try {
    const articles = await AwarenessArticle.find()
      .populate("categoryId", "name")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error("Get All Articles Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to get all articles",
    });
  }
};

// @desc    Create article
// @route   POST /api/awareness
// @access  Admin
const createArticle = async (req, res) => {
  try {
    const { title, content, categoryId, imageUrl, status } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Title, content and category are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const articleStatus = status || "Draft";

    if (!["Draft", "Published", "Archived"].includes(articleStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article status",
      });
    }

    const article = await AwarenessArticle.create({
      title,
      content,
      categoryId,
      imageUrl: imageUrl || "",
      status: articleStatus,
      createdBy: req.user._id,
    });

    await AdminActivityLog.create({
      adminId: req.user._id,
      action: "CREATE_ARTICLE",
      entityType: "Article",
      entityId: article._id.toString(),
      details: {
        title: article.title,
        status: article.status,
      },
    });

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    console.error("Create Article Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create article",
    });
  }
};

// @desc    Update article
// @route   PUT /api/awareness/:id
// @access  Admin
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    const allowedFields = [
      "title",
      "content",
      "categoryId",
      "imageUrl",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.categoryId &&
        !mongoose.Types.ObjectId.isValid(updates.categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (
      updates.status &&
      !["Draft", "Published", "Archived"].includes(updates.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid article status",
      });
    }

    const article = await AwarenessArticle.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    await AdminActivityLog.create({
      adminId: req.user._id,
      action: "UPDATE_ARTICLE",
      entityType: "Article",
      entityId: article._id.toString(),
      details: {
        updatedFields: Object.keys(updates),
      },
    });

    res.status(200).json({
      success: true,
      message: "Article updated successfully",
      article,
    });
  } catch (error) {
    console.error("Update Article Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update article",
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/awareness/:id
// @access  Admin
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    const article = await AwarenessArticle.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    await AdminActivityLog.create({
      adminId: req.user._id,
      action: "DELETE_ARTICLE",
      entityType: "Article",
      entityId: article._id.toString(),
      details: {
        title: article.title,
      },
    });

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Delete Article Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete article",
    });
  }
};

module.exports = {
  getPublishedArticles,
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
};