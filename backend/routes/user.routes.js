
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizePermission = require("../middleware/authorizePermission");

const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

// GET ALL USERS
router.get(
  "/",
  authMiddleware,
  authorizePermission("users.view"),
  getAllUsers
);

// CREATE USER
router.post(
  "/",
  authMiddleware,
  authorizePermission("users.create"),
  createUser
);

// UPDATE USER
router.patch(
  "/:id",
  authMiddleware,
  authorizePermission("users.update"),
  updateUser
);

// DELETE USER
router.delete(
  "/:id",
  authMiddleware,
  authorizePermission("users.delete"),
  deleteUser
);

module.exports = router;
