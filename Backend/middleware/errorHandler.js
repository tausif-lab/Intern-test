// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    return res.status(400).json({
      status: "error",
      statusCode: 400,
      message: "Validation error",
      data: null,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      status: "error",
      statusCode: 409,
      message: `${field} already exists`,
      data: null,
      errors: [{ field, message: `${field} already exists` }],
      timestamp: new Date().toISOString(),
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      statusCode: 401,
      message: "Invalid token",
      data: null,
      errors: [{ message: "Invalid token" }],
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      statusCode: 401,
      message: "Token expired",
      data: null,
      errors: [{ message: "Token expired. Please login again." }],
      timestamp: new Date().toISOString(),
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    data: null,
    errors: [{ message }],
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;
