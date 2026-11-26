const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizePermission = require("../middleware/authorizePermission");

const {
  getAllRoles,
  createRole,
  getAllPermissions,
} = require("../controllers/role.controller");

// GET ALL ROLES
router.get(
  "/",
  authMiddleware,
  authorizePermission("roles.view"),
  getAllRoles
);

// CREATE CUSTOM ROLE
router.post(
  "/",
  authMiddleware,
  authorizePermission("roles.create"),
  createRole
);

// GET ALL ACTIVE PERMISSIONS
router.get(
  "/permissions",
  authMiddleware,
  authorizePermission("roles.view"),
  getAllPermissions
);

module.exports = router;