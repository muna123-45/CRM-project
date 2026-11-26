const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("role", "name description")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// CREATE USER (PERMISSION PROTECTED)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Validate input types
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input types",
      });
    }

    // 3. Normalize input
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Validate name
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters",
      });
    }

    // 5. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // 6. Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // 7. Validate Role ObjectId
    if (!mongoose.isValidObjectId(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    // 8. Find selected role in MongoDB
    const selectedRole = await Role.findOne({
      _id: role,
      isActive: true,
    });

    if (!selectedRole) {
      return res.status(400).json({
        success: false,
        message: "Selected role does not exist or is inactive",
      });
    }

    // 9. Check duplicate email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // 10. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 11. Create user with Role ObjectId
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: selectedRole._id,
    });

    // 12. Fetch user with role details (without password)
    const safeUser = await User.findById(user._id)
      .select("-password")
      .populate("role", "name description");

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: safeUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    console.error("Create user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // 1. Validate user ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // 2. Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email and role are required",
      });
    }

    // 3. Validate input types
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof role !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input types",
      });
    }

    // 4. Normalize input
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters",
      });
    }

    // 5. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // 6. Validate role ID
    if (!mongoose.isValidObjectId(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    // 7. Find existing user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 8. Check duplicate email (excluding current user)
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already used by another user",
      });
    }

    // 9. Check selected role
    const selectedRole = await Role.findOne({
      _id: role,
      isActive: true,
    });

    if (!selectedRole) {
      return res.status(400).json({
        success: false,
        message: "Selected role does not exist or is inactive",
      });
    }

    // 10. Update user
    user.name = trimmedName;
    user.email = normalizedEmail;
    user.role = selectedRole._id;

    await user.save();

    // 11. Return updated user without password
    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("role", "name description");

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate user ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // 2. Prevent deleting your own account
    if (req.user.id === id || req.user._id?.toString() === id) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // 3. Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Delete user permanently
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
