const express = require("express");
const router = express.Router();

const {
  getAllTasks,
  getTaskAssignees,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");

const authMiddleware = require("../middleware/authMiddleware");
const authorizePermission = require("../middleware/authorizePermission");

// GET ALL TASKS
router.get("/", authMiddleware, authorizePermission("tasks.view"), getAllTasks);

// GET USERS FOR TASK ASSIGNMENT
router.get(
  "/assignees",
  authMiddleware,
  authorizePermission.any("tasks.create", "tasks.update"),
  getTaskAssignees,
);

// CREATE TASK
router.post(
  "/",
  authMiddleware,
  authorizePermission("tasks.create"),
  createTask,
);

// UPDATE TASK
router.patch(
  "/:id",
  authMiddleware,
  authorizePermission("tasks.update"),
  updateTask,
);

// DELETE TASK
router.delete(
  "/:id",
  authMiddleware,
  authorizePermission("tasks.delete"),
  deleteTask,
);

module.exports = router;
