//Backend/controllers/authcontroller.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" },
  );
};

/**
 * POST /api/auth/register
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json(
          errorResponse(409, "User already exists with this email", [
            { field: "email", message: "Email already registered" },
          ]),
        );
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      role,
    });

    await user.save();
    console.log("User registered successfully:", user.email);

    // Generate JWT token
    const token = generateToken(user);

    // Send success response with structured data
    res.status(201).json(
      successResponse(201, "Registration successful", {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      }),
    );
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    console.log("Login attempt:", email, role);

    // Find user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      console.log("User not found:", email);
      return res
        .status(401)
        .json(
          errorResponse(401, "Invalid email or password", [
            { field: "credentials", message: "Email or password is incorrect" },
          ]),
        );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return res
        .status(401)
        .json(
          errorResponse(401, "Invalid email or password", [
            { field: "password", message: "Password is incorrect" },
          ]),
        );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Determine redirect URL based on role
    const redirectUrl =
      role === "admin"
        ? `/admin-dashboard?userID=${user._id}`
        : `/user-dashboard?userID=${user._id}`;

    console.log("Login successful for:", email, "Redirecting to:", redirectUrl);

    // Send success response
    res.status(200).json(
      successResponse(200, "Login successful", {
        token,
        redirectUrl,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      }),
    );
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

module.exports = { register, login };
