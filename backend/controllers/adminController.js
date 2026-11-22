
const mongoose = require("mongoose");

const Report = require("../models/Report");
const User = require("../models/User");
const ReportStatusHistory = require("../models/ReportStatusHistory");
const AdminActivityLog = require("../models/AdminActivityLog");
const Notification = require("../models/Notification");
const sendEmail = require("../config/emailService");

// ==========================================
// GET ALL REPORTS
// @route GET /api/admin/reports
// @access Admin
// ==========================================

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get All Reports Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get reports",
    });
  }
};

// ==========================================
// UPDATE REPORT STATUS
// @route PATCH /api/admin/reports/:id/status
// @access Admin
// ==========================================

const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Resolved",
      "Rejected",
    ];

    // Validate report ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    // Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status",
      });
    }

    // Find report
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const oldStatus = report.status;

    // Update status
    report.status = status;
    await report.save();

    // Save history and admin activity
    if (oldStatus !== status) {
      await ReportStatusHistory.create({
        reportId: report._id,
        changedBy: req.user._id,
        oldStatus,
        newStatus: status,
        note: note || "",
      });

      await AdminActivityLog.create({
        adminId: req.user._id,
        action: "UPDATE_REPORT_STATUS",
        entityType: "Report",
        entityId: report._id.toString(),
        details: {
          oldStatus,
          newStatus: status,
          note: note || "",
        },
      });
    }

    let notificationSent = false;
    let emailSent = false;

    // Notify the report owner only when status becomes Resolved
    if (
      oldStatus !== "Resolved" &&
      status === "Resolved"
    ) {
      const user = await User.findById(report.userId)
        .select("firstName lastName email");

      // Create in-app notification
      try {
        await Notification.create({
          userId: report.userId,
          reportId: report._id,
          title: "Your report has been resolved!",
          message: `Your EcoPulse report #${report._id
            .toString()
            .slice(-6)} has been resolved successfully.`,
          type: "report_resolved",
        });

        notificationSent = true;

      } catch (notificationError) {
        console.error(
          "Notification Creation Error:",
          notificationError.message
        );
      }

      // Send email
      if (user && user.email) {
        emailSent = await sendEmail({
          to: user.email,
          subject: "EcoPulse - Your Report Has Been Resolved",
          html: `
            <div style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 25px;
              color: #222;
              border: 1px solid #eee;
              border-radius: 12px;
            ">

              <h2 style="color: #7650A8;">
                EcoPulse
              </h2>

              <h3>Hello ${user.firstName},</h3>

              <p>
                Good news! Your reported issue has been resolved.
              </p>

              <p>
                <strong>Report ID:</strong>
                #${report._id.toString().slice(-6)}
              </p>

              <p>
                <strong>New Status:</strong>
                Resolved
              </p>

              <p>
                Thank you for helping us keep our environment clean.
              </p>

              <p>
                Best regards,<br />
                EcoPulse Team
              </p>

            </div>
          `,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      report,
      notificationSent,
      emailSent,
    });

  } catch (error) {
    console.error(
      "Update Report Status Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update report status",
    });
  }
};

// ==========================================
// GET DASHBOARD STATISTICS
// @route GET /api/admin/dashboard
// @access Admin
// ==========================================

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      rejectedReports,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Report.countDocuments(),
      Report.countDocuments({ status: "Pending" }),
      Report.countDocuments({ status: "In Progress" }),
      Report.countDocuments({ status: "Resolved" }),
      Report.countDocuments({ status: "Rejected" }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalReports,
        pendingReports,
        inProgressReports,
        resolvedReports,
        rejectedReports,
      },
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get dashboard statistics",
    });
  }
};

// ==========================================
// GET ALL USERS
// @route GET /api/admin/users
// @access Admin
// ==========================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("firstName lastName email phone isActive createdAt")
      .sort({ _id: -1 });

    const activeUsers = users.filter(
      (user) => user.isActive
    ).length;

    return res.status(200).json({
      success: true,
      count: users.length,
      activeUsers,
      users,
    });

  } catch (error) {
    console.error("Get All Users Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getAllReports,
  updateReportStatus,
  getDashboardStats,
  getAllUsers,
};
