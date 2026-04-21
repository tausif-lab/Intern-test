const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllTasks,
  createTask,
  deleteTask,
  updateTaskStatus,
  getAllUsers,
} = require('../controllers/taskController');

// All routes require authentication
router.use(protect);

// GET  /api/tasks        → admin: all tasks | user: own tasks
router.get('/', getAllTasks);

// POST /api/tasks        → admin only: create & assign a task
router.post('/', adminOnly, createTask);

// DELETE /api/tasks/:id  → admin only
router.delete('/:id', adminOnly, deleteTask);

// PATCH /api/tasks/:id/status → authenticated user (own tasks) or admin
router.patch('/:id/status', updateTaskStatus);

// GET /api/users         → admin only: list of regular users
router.get('/users', adminOnly, getAllUsers);

module.exports = router;
