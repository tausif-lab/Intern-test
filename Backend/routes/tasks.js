const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllTasks,
  createTask,
  deleteTask,
  updateTaskStatus,
  getAllUsers,
} = require("../controllers/taskController");
const {
  createTaskValidators,
  updateTaskStatusValidators,
  deleteTaskValidators,
  handleValidationErrors,
} = require("../utils/validators");

// ─── All routes require authentication ─────────────────────────────────────
router.use(protect);


router.get("/", getAllTasks);


router.post(
  "/",
  adminOnly,
  createTaskValidators,
  handleValidationErrors,
  createTask,
);


router.delete(
  "/:id",
  adminOnly,
  deleteTaskValidators,
  handleValidationErrors,
  deleteTask,
);


router.patch(
  "/:id/status",
  updateTaskStatusValidators,
  handleValidationErrors,
  updateTaskStatus,
);


router.get("/users", adminOnly, getAllUsers);

module.exports = router;
