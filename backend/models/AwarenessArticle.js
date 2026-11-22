const mongoose = require("mongoose");

const awarenessArticleSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AwarenessCategory",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

const AwarenessArticle = mongoose.model(
  "AwarenessArticle",
  awarenessArticleSchema
);

module.exports = AwarenessArticle;