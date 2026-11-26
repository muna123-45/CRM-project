const authorizePermission = (
  ...requiredPermissions
) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userPermissions = req.user.permissions || [];

    // Default: user must have ALL permissions
    const hasPermission = requiredPermissions.every(
      (permission) => userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
      });
    }

    next();
  };
};

// Separate middleware for ANY ONE permission
authorizePermission.any = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userPermissions = req.user.permissions || [];

    const hasPermission = requiredPermissions.some(
      (permission) => userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
      });
    }

    next();
  };
};

module.exports = authorizePermission;
