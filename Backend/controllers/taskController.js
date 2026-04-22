const Task = require("../models/Task");
const User = require("../models/User");
const {
  successResponse,
  errorResponse,
} = require("../utils/responseFormatter");


const getAllTasks = async (req, res, next) => {
  try {
    let tasks;
    if (req.user.role === "admin") {
      tasks = await Task.find()
        .populate("assignedTo", "fullName email")
        .populate("assignedBy", "fullName email")
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate("assignedBy", "fullName email")
        .sort({ createdAt: -1 });
    }

    res
      .status(200)
      .json(successResponse(200, "Tasks retrieved successfully", { tasks }));
  } catch (error) {
    next(error);
  }
};


const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    // Verify target user exists
    const targetUser = await User.findById(assignedTo);
    if (!targetUser) {
      return res
        .status(404)
        .json(
          errorResponse(404, "Assigned user not found.", [
            {
              field: "assignedTo",
              message: "The specified user does not exist",
            },
          ]),
        );
    }

    const task = new Task({
      title,
      description: description || "",
      assignedTo,
      assignedBy: req.user._id,
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "pending",
    });

    await task.save();
    await task.populate("assignedTo", "fullName email");
    await task.populate("assignedBy", "fullName email");

    res
      .status(201)
      .json(successResponse(201, "Task created successfully", { task }));
  } catch (error) {
    next(error);
  }
};


const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json(
          errorResponse(404, "Task not found.", [
            { field: "id", message: "The specified task does not exist" },
          ]),
        );
    }

    await Task.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .json(
        successResponse(200, "Task deleted successfully", {
          taskId: req.params.id,
        }),
      );
  } catch (error) {
    next(error);
  }
};


const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res
        .status(404)
        .json(
          errorResponse(404, "Task not found.", [
            { field: "id", message: "The specified task does not exist" },
          ]),
        );
    }

    // Users can only update their own tasks; admins can update any
    if (
      req.user.role !== "admin" &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json(
          errorResponse(403, "Not authorized to update this task.", [
            { message: "You can only update tasks assigned to you" },
          ]),
        );
    }

    task.status = status;
    await task.save();
    await task.populate("assignedTo", "fullName email");
    await task.populate("assignedBy", "fullName email");

    res
      .status(200)
      .json(successResponse(200, "Task status updated successfully", { task }));
  } catch (error) {
    next(error);
  }
};


const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select(
      "_id fullName email role",
    );

    res
      .status(200)
      .json(successResponse(200, "Users retrieved successfully", { users }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  createTask,
  deleteTask,
  updateTaskStatus,
  getAllUsers,
};
