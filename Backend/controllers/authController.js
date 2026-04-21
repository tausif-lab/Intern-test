//Backend/controllers/authcontroller.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token - FIXED TYPOS
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

const register = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword, role } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "password is not same" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Create new user
    const userData = {
      fullName,
      email,

      password,

      role,
    };

    const user = new User(userData);

    await user.save();
    console.log("User registered successfully :", user.email);

    // Generate JWT token
    const token = generateToken(user);

    // Send response with token and user details
    res.status(201).json({
      message: "Registration successful with face enrollment",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,

        email: user.email,

        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    console.log("Login attempt:", email, role);

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by email and other credentials
    const user = await User.findOne({ email, role });
    // FIXED: was user1Id, branch (not used in this context)
    if (!user) {
      console.log("User not found:", email);
      return res
        .status(401)
        .json({ message: "Email is invalid or not registered" });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ message: "Password is invalid" });
    }

    // Check role
    if (user.role !== role) {
      console.log(
        "Role mismatch for user:",
        email,
        "Expected:",
        role,
        "Actual:",
        user.role,
      );
      return res.status(401).json({ message: "Invalid role selected" });
    }

    // Generate JWT token
    const token = generateToken(user);

    let redirectUrl;
    if (user.password && user.email) {
      if (role === "admin") {
        redirectUrl = `/admin-dashboard?userID=${user._id}`;
      } else {
        redirectUrl = `/user-dashboard?userID=${user._id}`;
      }
    }

    console.log("Login successful for:", email, "Redirecting to:", redirectUrl);

    // In the login function, update the user object in the response:

    res.json({
      message: "Login successful",
      token,
      redirectUrl,
      user: {
        id: user._id,
        _id: user._id, // Add this for compatibility
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

module.exports = {
  register,

  login,
};
