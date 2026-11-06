
const crypto = require("crypto");

const {
  USER_COOKIE_NAME,
  hashUserToken,
  createUserCsrfToken,
  isAllowedUserOrigin,
} = require("../utils/userSecurity");

// ======================================================
// VERIFY USER SESSION
// ======================================================

async function userAuth(req, res, next) {
  try {
    const sessionToken =
      req.cookies?.[USER_COOKIE_NAME];

    if (
      typeof sessionToken !== "string" ||
      !/^[a-f0-9]{64}$/.test(sessionToken)
    ) {
      return res.status(401).json({
        success: false,
        message: "Please log in.",
      });
    }

    const db = req.app.locals.db;

    const sessionTokenHash =
      hashUserToken(sessionToken);

    // ==================================================
    // FIND ACTIVE USER SESSION
    // ==================================================

    const session = await db
      .collection("userSessions")
      .findOne({
        tokenHash: sessionTokenHash,
        expiresAt: {
          $gt: new Date(),
        },
      });

    if (!session) {
      return res.status(401).json({
        success: false,
        message:
          "Your session has expired. Please log in again.",
      });
    }

    // ==================================================
    // VERIFY THAT USER STILL EXISTS
    // ==================================================

    const user = await db
      .collection("users")
      .findOne({
        _id: session.userId,
        emailVerified: true,
        isActive: true,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Your account is unavailable.",
      });
    }

    // ==================================================
    // ATTACH AUTHENTICATED USER TO REQUEST
    // ==================================================

    req.userId = user._id;

    req.user = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.emailNormalized,
      mobile: user.mobileE164,
      role: "user",
    };

    req.userSessionToken = sessionToken;

    req.userSessionTokenHash =
      sessionTokenHash;

    next();

  } catch (error) {
    console.error(
      "User authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify user session.",
    });
  }
}

// ======================================================
// REQUIRE CSRF TOKEN FOR PROTECTED WRITE REQUESTS
// ======================================================

function requireUserCsrf(req, res, next) {
  if (!isAllowedUserOrigin(req)) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed.",
    });
  }

  const suppliedToken =
    req.get("X-User-CSRF");

  if (
    typeof suppliedToken !== "string" ||
    !/^[a-f0-9]{64}$/.test(suppliedToken)
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid security token.",
    });
  }

  const expectedToken =
    createUserCsrfToken(
      req.userSessionToken
    );

  const suppliedBuffer =
    Buffer.from(suppliedToken, "hex");

  const expectedBuffer =
    Buffer.from(expectedToken, "hex");

  if (
    !crypto.timingSafeEqual(
      suppliedBuffer,
      expectedBuffer
    )
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid security token.",
    });
  }

  next();
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  userAuth,
  requireUserCsrf,
};
