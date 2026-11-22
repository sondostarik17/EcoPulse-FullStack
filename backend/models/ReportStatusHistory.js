const mongoose = require("mongoose");

const reportStatusHistorySchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    oldStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: null,
    },

    newStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      required: true,
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const ReportStatusHistory = mongoose.model(
  "ReportStatusHistory",
  reportStatusHistorySchema
);

module.exports = ReportStatusHistory;   