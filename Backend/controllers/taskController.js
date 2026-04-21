const Task = require('../models/Task');
const User = require('../models/User');

// ─── GET /api/tasks ──────────────────────────────────────────────────────────
// Admin: all tasks with user details populated
// User: only their own tasks
const getAllTasks = async (req, res, next) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find()
        .populate('assignedTo', 'fullName email')
        .populate('assignedBy', 'fullName email')
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate('assignedBy', 'fullName email')
        .sort({ createdAt: -1 });
    }
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/tasks ─────────────────────────────────────────────────────────
// Admin only – create and assign a task to a user
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({ message: 'Title and assignedTo are required.' });
    }

    // Verify target user exists and is a regular user
    const targetUser = await User.findById(assignedTo);
    if (!targetUser) {
      return res.status(404).json({ message: 'Assigned user not found.' });
    }

    const task = new Task({
      title,
      description: description || '',
      assignedTo,
      assignedBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'pending',
    });

    await task.save();
    await task.populate('assignedTo', 'fullName email');
    await task.populate('assignedBy', 'fullName email');

    res.status(201).json({ message: 'Task created successfully.', task });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
// Admin only – delete a task
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/tasks/:id/status ─────────────────────────────────────────────
// User only – update their task status between pending and completed
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "pending" or "completed".' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Users can only update their own tasks; admins can update any
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task.' });
    }

    task.status = status;
    await task.save();
    await task.populate('assignedTo', 'fullName email');
    await task.populate('assignedBy', 'fullName email');

    res.json({ message: 'Task status updated.', task });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/users ───────────────────────────────────────────────────────────
// Admin only – get all users (for the assignee dropdown)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).select('fullName email role');
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTasks, createTask, deleteTask, updateTaskStatus, getAllUsers };
