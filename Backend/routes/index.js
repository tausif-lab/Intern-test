const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const taskRoutes = require('./tasks');

// Auth routes
router.use('/api/v1/auth', authRoutes);

// Task routes (includes /api/tasks/users for admin user list)
router.use('/api/v1/tasks', taskRoutes);

module.exports = router;