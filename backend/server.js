
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const awarenessRoutes = require("./routes/awarenessRoutes");
const otpRoutes = require("./routes/otpRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Error Middleware
const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

// Create Express App
const app = express();

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman and requests without Origin
    if (!origin) {
      return callback(null, true);
    }

    // Allow local development
    const isLocalhost =
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    // Allow deployed frontend and admin
    if (
      isLocalhost ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked this origin: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

// ==========================================
// MIDDLEWARE
// ==========================================

// Log incoming requests
app.use((req, res, next) => {
  console.log(
    `[REQUEST] ${req.method} ${req.originalUrl}`
  );
  next();
});

app.use(cors(corsOptions));

app.use(express.json({ limit: "2mb" }));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// ==========================================
// API REQUEST LOGGER
// ==========================================

app.use("/api", (req, res, next) => {
  console.log(
    `[API] ${req.method} ${req.originalUrl}`
  );
  next();
});

// ==========================================
// MAIN ROUTES
// ==========================================

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EcoPulse Backend is Running",
    database: "MongoDB",
    imageStorage: "MongoDB GridFS",
  });
});

// Health check for Render
app.get("/healthz", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EcoPulse Backend is healthy",
  });
});

// Test auth route
app.get("/test-auth", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth routes are loaded successfully",
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/awareness", awarenessRoutes);

app.use("/api/otp", otpRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/notifications", notificationRoutes);

// ==========================================
// ERROR HANDLING
// Must stay AFTER all routes
// ==========================================

app.use(notFound);

app.use(errorHandler);

// ==========================================
// SERVER CONFIGURATION
// ==========================================

const PORT = process.env.PORT || 5000;

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("--------------------------------");
      console.log("       EcoPulse Backend");
      console.log("--------------------------------");
      console.log("MongoDB: Connected");
      console.log("Image Storage: MongoDB GridFS");
      console.log("GridFS Bucket: reportsImages");
      console.log(`Server Port: ${PORT}`);
      console.log(`API: Running on port ${PORT}`);
      console.log("--------------------------------");
    });

  } catch (error) {
    console.error(
      "Server Startup Failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
