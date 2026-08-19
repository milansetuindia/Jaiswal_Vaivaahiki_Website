// backend/middleware/adminAuth.js

const jwt = require("jsonwebtoken");

function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication format",
      });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      !decoded ||
      decoded.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.admin = decoded;

    next();

  } catch (error) {
    console.error(
      "Admin authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
}

module.exports = adminAuth;
