const mongoose = require("mongoose");

const adminActivityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    entityType: {
      type: String,
      required: true,
      enum: ["User", "Report", "Article", "Category"],
    },

    entityId: {
      type: String,
      required: true,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const AdminActivityLog = mongoose.model(
  "AdminActivityLog",
  adminActivityLogSchema
);

module.exports = AdminActivityLog;