const mongoose = require("mongoose");
const Role = require("../models/Role");
const Permission = require("../models/Permission");

// GET ALL ACTIVE ROLES
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true })
      .populate("permissions", "name key module action description")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      totalRoles: roles.length,
      roles,
    });
  } catch (error) {
    console.error("Get all roles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
    });
  }
};

// CREATE CUSTOM ROLE
const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // 1. Validate required fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      !Array.isArray(permissions)
    ) {
      return res.status(400).json({
        success: false,
        message: "Role name and permissions array are required",
      });
    }

    // 2. Validate role name
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Role name must contain at least 2 characters",
      });
    }

    // 3. Validate description
    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be a string",
      });
    }

    // 4. Check whether role already exists
    const existingRole = await Role.findOne({
      name: {
        $regex: `^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: "This role already exists",
      });
    }

    // 5. Validate permission IDs
    const uniquePermissionIds = [...new Set(permissions)];

    const invalidPermissionIds = uniquePermissionIds.some(
      (id) => typeof id !== "string" || !mongoose.isValidObjectId(id),
    );

    if (invalidPermissionIds) {
      return res.status(400).json({
        success: false,
        message: "One or more permission IDs are invalid",
      });
    }

    // 6. Find selected active permissions
    const selectedPermissions = await Permission.find({
      _id: { $in: uniquePermissionIds },
      isActive: true,
    });

    if (selectedPermissions.length !== uniquePermissionIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more permissions do not exist or are inactive",
      });
    }

    // 7. Create custom role
    const role = await Role.create({
      name: trimmedName,
      description: description?.trim() || "",
      permissions: selectedPermissions.map((permission) => permission._id),
      isSystemRole: false,
      isActive: true,
    });

    // 8. Return created role with permission details
    const createdRole = await Role.findById(role._id).populate(
      "permissions",
      "name key module action description",
    );

    return res.status(201).json({
      success: true,
      message: "Custom role created successfully",
      role: createdRole,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This role already exists",
      });
    }

    console.error("Create role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create role",
    });
  }
};
// GET ALL ACTIVE PERMISSIONS
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find({
      isActive: true,
    }).sort({
      module: 1,
      action: 1,
    });

    return res.status(200).json({
      success: true,
      message: "Permissions fetched successfully",
      totalPermissions: permissions.length,
      permissions,
    });
  } catch (error) {
    console.error("Get all permissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch permissions",
    });
  }
};

// EXPORT CONTROLLERS
module.exports = {
  getAllRoles,
  createRole,
  getAllPermissions,
};
