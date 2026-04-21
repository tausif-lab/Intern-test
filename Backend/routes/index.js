const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const taskRoutes = require('./tasks');

// Auth routes
router.use('/api/auth', authRoutes);

// Task routes (includes /api/tasks/users for admin user list)
router.use('/api/tasks', taskRoutes);

module.exports = router;