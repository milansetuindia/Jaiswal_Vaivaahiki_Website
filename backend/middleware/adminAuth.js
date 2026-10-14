
const crypto = require("crypto");

const {
  COOKIE_NAME,
  sha256,
} = require("../utils/adminSecurity");

function safeEqual(a, b) {
  if (
    typeof a !== "string" ||
    typeof b !== "string" ||
    a.length !== b.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  );
}

async function adminAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/.test(token)
    ) {
      return res.status(401).json({
        success: false,
        message: "Admin login required.",
      });
    }

    const tokenHash = sha256(token);

    const session = await req.app.locals.db
      .collection("adminSessions")
      .findOne({
        tokenHash,
        role: "admin",
        expiresAt: { $gt: new Date() },
      });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in.",
      });
    }

    // Protect all requests that change data.
    if (
      ["POST", "PUT", "PATCH", "DELETE"]
        .includes(req.method)
    ) {
      const allowedOrigins = [
        "https://jaiswal-vaivaahiki.netlify.app",
        "http://localhost:5173",
      ];

      if (!allowedOrigins.includes(req.get("origin"))) {
        return res.sendStatus(403);
      }

      const csrf = req.get("x-admin-csrf");

      if (
        !safeEqual(
          sha256(typeof csrf === "string" ? csrf : ""),
          session.csrfHash
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "Invalid security token.",
        });
      }
    }

    req.admin = {
      username: session.username,
      role: "admin",
    };

    req.sessionToken = token;
    req.sessionTokenHash = tokenHash;

    next();

  } catch (error) {
    console.error("Admin session error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication check failed.",
    });
  }
}

module.exports = adminAuth;
