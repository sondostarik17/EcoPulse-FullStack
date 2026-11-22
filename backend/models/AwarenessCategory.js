
const AwarenessCategory = require("../models/AwarenessCategory");

// GET ALL CATEGORIES
const getCategories = async (req, res, next) => {
  try {
    const categories = await AwarenessCategory.find().sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE CATEGORY
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await AwarenessCategory.create({
      name: name.trim(),
      description: description || "",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This category already exists",
      });
    }
    next(error);
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const category = await AwarenessCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }
      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This category already exists",
      });
    }
    next(error);
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res, next) => {
  try {
    const category = await AwarenessCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const linkedArticles = await AwarenessArticle.countDocuments({
      categoryId: category._id,
    });

    if (linkedArticles > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a category that has articles",
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};