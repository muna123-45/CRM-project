require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Role = require("../models/Role");

const migrateUserRoles = async () => {
  try {
    await connectDB();

    console.log("Starting user role migration...");

    // 1. Get the native MongoDB users collection.
    // This avoids Mongoose casting the old string role field.
    const usersCollection = mongoose.connection.collection("users");

    // 2. Find all existing users.
    const users = await usersCollection.find({}).toArray();

    console.log(`Found ${users.length} users.`);

    // 3. Get all default roles.
    const roles = await Role.find({
      name: { $in: ["Admin", "Manager", "Employee"] },
    }).lean();

    const roleMap = new Map(
      roles.map((role) => [role.name.toLowerCase(), role._id])
    );

    // 4. Check that all required roles exist.
    for (const roleName of ["admin", "manager", "employee"]) {
      if (!roleMap.has(roleName)) {
        throw new Error(`Missing default role: ${roleName}`);
      }
    }

    // 5. Validate all existing users before changing anything.
    const migrations = [];

    for (const user of users) {
      // Already migrated users are skipped.
      if (user.role instanceof mongoose.Types.ObjectId) {
        continue;
      }

      const oldRole = String(user.role || "").toLowerCase().trim();
      const newRoleId = roleMap.get(oldRole);

      if (!newRoleId) {
        throw new Error(
          `Unknown role "${user.role}" found for user ${user.email}`
        );
      }

      migrations.push({
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: { role: newRoleId },
          },
        },
      });
    }

    console.log(`${migrations.length} users need migration.`);

    // 6. Update all users.
    if (migrations.length > 0) {
      const result = await usersCollection.bulkWrite(migrations);

      console.log(`${result.modifiedCount} users migrated.`);
    }

    console.log("User role migration completed successfully.");
  } catch (error) {
    console.error("User role migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

migrateUserRoles();
