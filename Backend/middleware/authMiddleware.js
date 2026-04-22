const jwt = require("jsonwebtoken");
const User = require("../models/User");


const protect = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        statusCode: 401,
        message: "Not authenticated. Token missing.",
        data: null,
        errors: [{ message: "Authorization token required" }],
        timestamp: new Date().toISOString(),
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        status: "error",
        statusCode: 401,
        message: "User not found. Token invalid.",
        data: null,
        errors: [{ message: "User associated with token not found" }],
        timestamp: new Date().toISOString(),
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        statusCode: 401,
        message: "Token expired. Please login again.",
        data: null,
        errors: [{ message: "Token has expired" }],
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(401).json({
      status: "error",
      statusCode: 401,
      message: "Invalid token.",
      data: null,
      errors: [{ message: "Token validation failed" }],
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * adminOnly middleware – must be used AFTER protect.
 * Blocks any non-admin user with 403.
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      statusCode: 403,
      message: "Access denied. Admins only.",
      data: null,
      errors: [{ message: "This action requires admin privileges" }],
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

module.exports = { protect, adminOnly };
