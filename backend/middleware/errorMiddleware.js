// Handle not found routes
const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);

  res.status(404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack:
      process.env.NODE_ENV === "development"
        ? err.stack
        : undefined,
  });
};

module.exports = {
  notFound,
  errorHandler,
};