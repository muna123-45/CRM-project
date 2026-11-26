const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");

// GET ALL TASKS
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      totalTasks: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

// CREATE TASK
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, status, dueDate } =
      req.body;

    // 1. Validate required fields
    if (!title || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Task title and assigned user are required",
      });
    }

    // 2. Validate input types
    if (typeof title !== "string" || typeof assignedTo !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid input types",
      });
    }

    // 3. Validate title
    const trimmedTitle = title.trim();

    if (trimmedTitle.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Task title must contain at least 2 characters",
      });
    }

    // 4. Validate assigned user ID
    if (!mongoose.isValidObjectId(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assigned user ID",
      });
    }

    // 5. Check assigned user
    const assignedUser = await User.findById(assignedTo);

    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found",
      });
    }

    // 6. Validate priority
    const allowedPriorities = ["Low", "Medium", "High"];

    if (priority !== undefined && !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    // 7. Validate status
    const allowedStatuses = ["Pending", "In Progress", "Completed"];

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    // 8. Validate due date
    let parsedDueDate = null;

    if (dueDate) {
      parsedDueDate = new Date(dueDate);

      if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date",
        });
      }
    }

    // 9. Get logged-in user ID
    const creatorId = req.user.id || req.user._id;

    if (!mongoose.isValidObjectId(creatorId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid logged-in user",
      });
    }

    // 10. Create task
    const task = await Task.create({
      title: trimmedTitle,
      description: description?.trim() || "",
      assignedTo,
      createdBy: creatorId,
      priority: priority || "Medium",
      status: status || "Pending",
      dueDate: parsedDueDate,
    });

    // 11. Return task with user details
    const createdTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: createdTask,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

// UPDATE TASK
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description, assignedTo, priority, status, dueDate } =
      req.body;

    // 1. Validate task ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    // 2. Find existing task
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // 3. Validate and update title
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Task title must contain at least 2 characters",
        });
      }

      task.title = title.trim();
    }

    // 4. Update description
    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid description",
        });
      }

      task.description = description.trim();
    }

    // 5. Update assigned user
    if (assignedTo !== undefined) {
      if (!mongoose.isValidObjectId(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assigned user ID",
        });
      }

      const assignedUser = await User.findById(assignedTo);

      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found",
        });
      }

      task.assignedTo = assignedTo;
    }

    // 6. Update priority
    if (priority !== undefined) {
      const allowedPriorities = ["Low", "Medium", "High"];

      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task priority",
        });
      }

      task.priority = priority;
    }

    // 7. Update status
    if (status !== undefined) {
      const allowedStatuses = ["Pending", "In Progress", "Completed"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task status",
        });
      }

      task.status = status;
    }

    // 8. Update due date
    if (dueDate !== undefined) {
      if (dueDate === null || dueDate === "") {
        task.dueDate = null;
      } else {
        const parsedDueDate = new Date(dueDate);

        if (Number.isNaN(parsedDueDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid due date",
          });
        }

        task.dueDate = parsedDueDate;
      }
    }

    // 9. Save updated task
    await task.save();

    // 10. Return updated task
    const updatedTask = await Task.findById(id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

// DELETE TASK
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate task ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    // 2. Find task
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // 3. Delete task
    await Task.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};

// GET USERS FOR TASK ASSIGNMENT
const getTaskAssignees = async (req, res) => {
  try {
    const users = await User.find().select("_id name email").sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Task assignees fetched successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Get task assignees error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch task assignees",
    });
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskAssignees,
};
