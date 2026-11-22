
const mongoose = require("mongoose");
const { Readable } = require("stream");

const Report = require("../models/Report");
const getGridFSBucket = require("../config/gridfs");

// ============================================
// UPLOAD IMAGE TO GRIDFS
// ============================================
const uploadImageToGridFS = (file, userId) => {
  return new Promise((resolve, reject) => {
    try {
      if (!file || !file.buffer) {
        return reject(new Error("Image file is required."));
      }

      const bucket = getGridFSBucket();

      const safeName = (file.originalname || "report-image")
        .replace(/[^a-zA-Z0-9._-]/g, "_");

      const uploadStream = bucket.openUploadStream(
        `${Date.now()}-${safeName}`,
        {
          metadata: {
            userId: userId.toString(),
            contentType: file.mimetype,
            originalName: file.originalname,
          },
        }
      );

      uploadStream.on("error", reject);

      uploadStream.on("finish", () => {
        resolve(uploadStream.id);
      });

      Readable.from(file.buffer).pipe(uploadStream);
    } catch (error) {
      reject(error);
    }
  });
};

// ============================================
// DELETE IMAGE FROM GRIDFS
// ============================================
const deleteImageFromGridFS = async (fileId) => {
  if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
    return;
  }

  const bucket = getGridFSBucket();
  const objectId = new mongoose.Types.ObjectId(fileId);

  // Check whether the image exists first
  const files = await bucket.find({ _id: objectId })
    .limit(1)
    .toArray();

  if (!files.length) {
    console.log("GridFS image was not found:", fileId);
    return;
  }

  await bucket.delete(objectId);

  console.log("GridFS image deleted:", fileId);
};

// ============================================
// PARSE AI RESULT
// ============================================
const parseAIResult = (value) => {
  if (!value) return "";

  try {
    const parsed = typeof value === "string"
      ? JSON.parse(value)
      : value;

    return JSON.stringify(parsed);
  } catch (error) {
    return "";
  }
};

// ============================================
// CREATE REPORT
// POST /api/reports
// ============================================
const createReport = async (req, res) => {
  let uploadedFileId = null;

  try {
    const {
      description,
      address,
      latitude,
      longitude,
      issueType,
      aiResult,
      aiVerified,
    } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a report description.",
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide the report address.",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      latitude === undefined ||
      longitude === undefined ||
      latitude === "" ||
      longitude === "" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location coordinates.",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Please upload a report image.",
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    uploadedFileId = await uploadImageToGridFS(
      req.file,
      req.user._id
    );

    const report = await Report.create({
      userId: req.user._id,
      description: description.trim(),
      address: address.trim(),
      latitude: lat,
      longitude: lng,
      issueType: issueType || "General Waste",
      imageUrl: `/api/reports/image/${uploadedFileId}`,
      aiResult: parseAIResult(aiResult),
      aiVerified: aiVerified === "true",
      status: "Pending",
      priority: "Medium",
    });

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully.",
      report,
    });

  } catch (error) {
    console.error("Create Report Error:", error);

    if (uploadedFileId) {
      try {
        await deleteImageFromGridFS(uploadedFileId);
      } catch (deleteError) {
        console.error("GridFS cleanup error:", deleteError.message);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create report.",
      error: error.message,
    });
  }
};

// ============================================
// GET MY REPORTS
// GET /api/reports/my-reports
// ============================================
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });

  } catch (error) {
    console.error("Get My Reports Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve reports.",
    });
  }
};

// ============================================
// GET SINGLE REPORT
// GET /api/reports/:id
// ============================================
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID.",
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    const isOwner =
      report.userId.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this report.",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });

  } catch (error) {
    console.error("Get Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve report.",
    });
  }
};

// ============================================
// GET REPORT IMAGE
// GET /api/reports/image/:fileId
// ============================================
const getReportImage = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image ID.",
      });
    }

    const bucket = getGridFSBucket();
    const objectId = new mongoose.Types.ObjectId(fileId);

    const files = await bucket.find({ _id: objectId })
      .limit(1)
      .toArray();

    if (!files.length) {
      return res.status(404).json({
        success: false,
        message: "Image not found.",
      });
    }

    const contentType =
      files[0].metadata?.contentType || "application/octet-stream";

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(contentType)) {
      return res.status(415).json({
        success: false,
        message: "Unsupported image type.",
      });
    }

    res.set({
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    });

    const downloadStream = bucket.openDownloadStream(objectId);

    downloadStream.on("error", (error) => {
      console.error("Image Stream Error:", error.message);

      if (!res.headersSent) {
        res.status(404).end();
      } else {
        res.destroy(error);
      }
    });

    downloadStream.pipe(res);

  } catch (error) {
    console.error("Get Report Image Error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to load image.",
      });
    }
  }
};

// ============================================
// DELETE REPORT
// DELETE /api/reports/:id
// ============================================
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("DELETE CONTROLLER STARTED:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID.",
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    const isOwner =
      report.userId.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this report.",
      });
    }

    // Extract GridFS image ID from the image URL
    const imageMatch = report.imageUrl?.match(
      /([a-f0-9]{24})$/i
    );

    // Delete the report document first
    await Report.findByIdAndDelete(id);

    console.log("Report deleted from MongoDB:", id);

    // Then try to delete its image
    if (imageMatch) {
      try {
        await deleteImageFromGridFS(imageMatch[1]);
      } catch (imageError) {
        console.error(
          "GridFS Image Delete Error:",
          imageError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully.",
      deletedReportId: id,
    });

  } catch (error) {
    console.error("Delete Report Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete report.",
      error: error.message,
    });
  }
};

// ============================================
// EXPORT CONTROLLERS
// ============================================
module.exports = {
  createReport,
  getMyReports,
  getReportById,
  getReportImage,
  deleteReport,
};