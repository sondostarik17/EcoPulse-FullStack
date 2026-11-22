
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // GridFS image URL
    imageUrl: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    issueType: {
      type: String,
      default: "General Waste",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Resolved",
        "Rejected",
      ],
      default: "Pending",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    aiVerified: {
      type: Boolean,
      default: false,
    },

    aiResult: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Improve user's reports search
reportSchema.index({
  userId: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Report", reportSchema);
