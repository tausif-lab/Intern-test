
const { body, param, validationResult } = require("express-validator");

// ─── AUTH VALIDATORS ──────────────────────────────────────────────────────────

const registerValidators = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and numbers"),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  body("role")
    .isIn(["admin", "user"])
    .withMessage('Role must be either "admin" or "user"'),
];

const loginValidators = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  body("role")
    .isIn(["admin", "user"])
    .withMessage('Role must be either "admin" or "user"'),
];

// ─── TASK VALIDATORS ─────────────────────────────────────────────────────────

const createTaskValidators = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("assignedTo")
    .notEmpty()
    .withMessage("Assigned user ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage('Priority must be "low", "medium", or "high"'),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format. Use ISO 8601 format (YYYY-MM-DD)")
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error("Due date cannot be in the past");
      }
      return true;
    }),
];

const updateTaskStatusValidators = [
  param("id").isMongoId().withMessage("Invalid task ID format"),

  body("status")
    .isIn(["pending", "completed"])
    .withMessage('Status must be either "pending" or "completed"'),
];

const deleteTaskValidators = [
  param("id").isMongoId().withMessage("Invalid task ID format"),
];

// ─── MIDDLEWARE TO HANDLE VALIDATION ERRORS ──────────────────────────────────

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(422).json({
      status: "error",
      statusCode: 422,
      message: "Validation failed",
      data: null,
      errors: formattedErrors,
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

module.exports = {
  registerValidators,
  loginValidators,
  createTaskValidators,
  updateTaskStatusValidators,
  deleteTaskValidators,
  handleValidationErrors,
};
