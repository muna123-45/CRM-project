
const User = require("../models/User");
const Role = require("../models/Role");
const Session = require("../models/Session");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Reusable role and permission population
const rolePopulation = {
  path: "role",
  select: "name permissions isActive",
  match: { isActive: true },
  populate: {
    path: "permissions",
    select: "key isActive",
    match: { isActive: true },
  },
};

// Fetch user with current role and active permissions
const getUserWithPermissions = async (userId) => {
  return User.findById(userId)
    .select("_id name email role")
    .populate(rolePopulation);
};

// Format safe user details for frontend
const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role.name,
  roleId: user.role._id,
  permissions: user.role.permissions.map(
    (permission) => permission.key
  ),
});

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // 2. Validate input types
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "All fields must be valid text",
      });
    }

    // 3. Normalize input
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Validate name
    if (trimmedName.length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters",
      });
    }

    // 5. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // 6. Validate password
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    // 7. Check duplicate email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // 8. Find default Employee role
    const employeeRole = await Role.findOne({
      name: "Employee",
      isActive: true,
    });

    if (!employeeRole) {
      return res.status(500).json({
        message: "Default Employee role is not available",
      });
    }

    // 9. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 10. Create user with Employee Role ObjectId
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: employeeRole._id,
    });

    // 11. Fetch user with role and permissions
    const registeredUser = await getUserWithPermissions(user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: formatUserResponse(registeredUser),
    });

  } catch (error) {
    console.error("Registration Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid input",
      });
    }

    // 2. Find user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 4. Fetch latest role and permissions
    const authenticatedUser = await getUserWithPermissions(
      user._id
    );

    if (!authenticatedUser || !authenticatedUser.role) {
      return res.status(403).json({
        message: "Your assigned role is inactive or unavailable",
      });
    }

    // 5. Generate Access Token
    const accessToken = jwt.sign(
      {},
      process.env.ACCESS_TOKEN_SECRET,
      {
        subject: user._id.toString(),
        expiresIn: "15m",
        algorithm: "HS256",
      }
    );

    // 6. Create session
    const session = await Session.create({
      user: user._id,
      refreshTokenHash: "temporary",
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    });

    // 7. Generate Refresh Token
    const refreshToken = jwt.sign(
      {
        sessionId: session._id.toString(),
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        subject: user._id.toString(),
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    // 8. Hash Refresh Token
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // 9. Store hash in Session collection
    session.refreshTokenHash = refreshTokenHash;
    await session.save();

    // 10. Send HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth",
    });

    // 11. Send login response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: formatUserResponse(authenticatedUser),
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

// Refresh Access Token
const refreshAccessToken = async (req, res) => {
  try {
    // 1. Read Refresh Token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing. Please log in again.",
      });
    }

    // 2. Verify Refresh Token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      { algorithms: ["HS256"] }
    );

    const userId = decoded.sub;
    const sessionId = decoded.sessionId;

    if (!userId || !sessionId) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // 3. Find corresponding session
    const session = await Session.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session || session.expiresAt <= new Date()) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    // 4. Hash received Refresh Token
    const receivedHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest();

    const storedHash = Buffer.from(
      session.refreshTokenHash,
      "hex"
    );

    // 5. Compare token hashes
    if (
      storedHash.length !== receivedHash.length ||
      !crypto.timingSafeEqual(storedHash, receivedHash)
    ) {
      await Session.deleteOne({ _id: session._id });

      return res.status(401).json({
        success: false,
        message: "Invalid refresh token. Please log in again.",
      });
    }

    // 6. Fetch latest user, role and permissions
    const user = await getUserWithPermissions(userId);

    if (!user || !user.role) {
      await Session.deleteOne({ _id: session._id });

      return res.status(401).json({
        success: false,
        message: "User account or assigned role is unavailable",
      });
    }

    // 7. Generate new Access Token
    const accessToken = jwt.sign(
      {},
      process.env.ACCESS_TOKEN_SECRET,
      {
        subject: user._id.toString(),
        expiresIn: "15m",
        algorithm: "HS256",
      }
    );

    // 8. Generate new Refresh Token
    const newRefreshToken = jwt.sign(
      {
        sessionId: session._id.toString(),
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        subject: user._id.toString(),
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    // 9. Hash new Refresh Token
    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    // 10. Replace old hash with new hash
    session.refreshTokenHash = newRefreshTokenHash;
    session.expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await session.save();

    // 11. Send new Refresh Token cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth",
    });

    // 12. Return new Access Token and latest user details
    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken,
      user: formatUserResponse(user),
    });

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
          process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/api/auth",
      });

      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or expired. Please log in again.",
      });
    }

    console.error("Refresh Token Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to refresh access token",
    });
  }
};

// Logout User
const logoutUser = async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth",
  };

  try {
    // 1. Read Refresh Token cookie
    const refreshToken = req.cookies?.refreshToken;

    // 2. Clear browser cookie
    res.clearCookie("refreshToken", cookieOptions);

    // 3. If no cookie, logout is already complete
    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }

    let decoded;

    // 4. Verify Refresh Token
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        { algorithms: ["HS256"] }
      );
    } catch (error) {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }

    const { sessionId } = decoded;
    const userId = decoded.sub;

    if (!sessionId || !userId) {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }

    // 5. Find matching session
    const session = await Session.findOne({
      _id: sessionId,
      user: userId,
    });

    if (session) {
      // 6. Hash received Refresh Token
      const receivedHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest();

      const storedHash = Buffer.from(
        session.refreshTokenHash,
        "hex"
      );

      // 7. Revoke only the matching session
      if (
        storedHash.length === receivedHash.length &&
        crypto.timingSafeEqual(storedHash, receivedHash)
      ) {
        await Session.deleteOne({ _id: session._id });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete logout",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};
