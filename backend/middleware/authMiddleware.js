
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get access token from request headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing",
      });
    }

    // 2. Verify access token
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET,
      { algorithms: ["HS256"] }
    );

    // 3. Find user and dynamically fetch role permissions
    const user = await User.findById(decoded.sub)
      .select("_id name email role")
      .populate({
        path: "role",
        select: "name permissions isActive",
        match: { isActive: true },
        populate: {
          path: "permissions",
          select: "key isActive",
          match: { isActive: true },
        },
      });

    // 4. Check whether user and role exist
    if (!user || !user.role) {
      return res.status(401).json({
        success: false,
        message: "User account or assigned role is unavailable.",
      });
    }

    // 5. Prepare user information for authorization
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role.name.toLowerCase(),
      roleId: user.role._id,
      permissions: user.role.permissions.map(
        (permission) => permission.key
      ),
    };

    // 6. Continue to the next middleware or controller
    next();

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    console.error("Authentication Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed due to a server error",
    });
  }
};

module.exports = authMiddleware;
