require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");
const Permission = require("../models/Permission");
const Role = require("../models/Role");

// Initial CRM permissions
const permissionData = [
  // Dashboard
  {
    name: "View Dashboard",
    key: "dashboard.view",
    module: "dashboard",
    action: "view",
  },

  // Users
  { name: "View Users", key: "users.view", module: "users", action: "view" },
  {
    name: "Create Users",
    key: "users.create",
    module: "users",
    action: "create",
  },
  {
    name: "Update Users",
    key: "users.update",
    module: "users",
    action: "update",
  },
  {
    name: "Delete Users",
    key: "users.delete",
    module: "users",
    action: "delete",
  },

  // Leads
  { name: "View Leads", key: "leads.view", module: "leads", action: "view" },
  {
    name: "Create Leads",
    key: "leads.create",
    module: "leads",
    action: "create",
  },
  {
    name: "Update Leads",
    key: "leads.update",
    module: "leads",
    action: "update",
  },
  {
    name: "Delete Leads",
    key: "leads.delete",
    module: "leads",
    action: "delete",
  },

  // Tasks
  { name: "View Tasks", key: "tasks.view", module: "tasks", action: "view" },
  {
    name: "Create Tasks",
    key: "tasks.create",
    module: "tasks",
    action: "create",
  },
  {
    name: "Update Tasks",
    key: "tasks.update",
    module: "tasks",
    action: "update",
  },
  {
    name: "Delete Tasks",
    key: "tasks.delete",
    module: "tasks",
    action: "delete",
  },

  // Activities
  {
    name: "View Activities",
    key: "activities.view",
    module: "activities",
    action: "view",
  },
  {
    name: "Create Activities",
    key: "activities.create",
    module: "activities",
    action: "create",
  },
  {
    name: "Update Activities",
    key: "activities.update",
    module: "activities",
    action: "update",
  },
  {
    name: "Delete Activities",
    key: "activities.delete",
    module: "activities",
    action: "delete",
  },

  // Reports
  {
    name: "View Reports",
    key: "reports.view",
    module: "reports",
    action: "view",
  },
  {
    name: "Create Reports",
    key: "reports.create",
    module: "reports",
    action: "create",
  },
  {
    name: "Update Reports",
    key: "reports.update",
    module: "reports",
    action: "update",
  },
  {
    name: "Delete Reports",
    key: "reports.delete",
    module: "reports",
    action: "delete",
  },

  // Roles
  { name: "View Roles", key: "roles.view", module: "roles", action: "view" },
  {
    name: "Create Roles",
    key: "roles.create",
    module: "roles",
    action: "create",
  },
  {
    name: "Update Roles",
    key: "roles.update",
    module: "roles",
    action: "update",
  },
  {
    name: "Delete Roles",
    key: "roles.delete",
    module: "roles",
    action: "delete",
  },

];

// Initial system roles
const roleData = [
  {
    name: "Admin",
    description: "Full access to all CRM modules and operations.",
    permissionKeys: permissionData.map((permission) => permission.key),
  },
  {
    name: "Manager",
    description: "Can access dashboard, leads, tasks, activities and reports.",
    permissionKeys: [
      "dashboard.view",
      "leads.view",
      "tasks.view",
      "activities.view",
      "reports.view",
    ],
  },
  {
    name: "Employee",
    description: "Can access dashboard, leads, tasks and activities.",
    permissionKeys: [
      "dashboard.view",
      "leads.view",
      "tasks.view",
      "activities.view",
    ],
  },
];

const seedRbac = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    console.log("Starting RBAC seed...");

    // 2. Create or update permissions
    const permissionDocuments = [];

    for (const permission of permissionData) {
      const savedPermission = await Permission.findOneAndUpdate(
        { key: permission.key },
        { $set: permission },
        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      );

      permissionDocuments.push(savedPermission);
    }

    console.log(`${permissionDocuments.length} permissions saved.`);

    // 3. Create a lookup map: permission key -> MongoDB ID
    const permissionMap = new Map(
      permissionDocuments.map((permission) => [permission.key, permission._id]),
    );

    // 4. Create or update default roles
    for (const roleDataItem of roleData) {
      const permissionIds = roleDataItem.permissionKeys.map((key) => {
        const permissionId = permissionMap.get(key);

        if (!permissionId) {
          throw new Error(`Permission not found: ${key}`);
        }

        return permissionId;
      });

      await Role.findOneAndUpdate(
        { name: roleDataItem.name },
        {
          $set: {
            name: roleDataItem.name,
            description: roleDataItem.description,
            permissions: permissionIds,
            isSystemRole: true,
            isActive: true,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      );

      console.log(`${roleDataItem.name} role saved.`);
    }

    console.log("RBAC seeding completed successfully.");
  } catch (error) {
    console.error("RBAC seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedRbac();
