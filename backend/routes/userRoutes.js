
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { rateLimit } = require("express-rate-limit");

const {
  userAuth,
  requireUserCsrf,
} = require("../middleware/userAuth");

const {
  USER_COOKIE_NAME,
  USER_SESSION_DAYS,
  EMAIL_OTP_MINUTES,
  randomUserToken,
  hashUserToken,
  normalizeEmail,
  normalizeMobile,
  hashEmailOtp,
  createUserCsrfToken,
  userCookieOptions,
  isAllowedUserOrigin,
} = require("../utils/userSecurity");

const router = express.Router();

// ======================================================
// USER EMAIL OTP POLICY
// ======================================================

const MAX_EMAIL_OTPS_PER_DAY = 5;
const OTP_WINDOW_MS = 24 * 60 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

// ======================================================
// RATE LIMITERS
// ======================================================

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration requests.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts.",
  },
});

const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts.",
  },
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests.",
  },
});

// ======================================================
// ORIGIN VALIDATION
// ======================================================

function requireAllowedOrigin(req, res, next) {
  if (!isAllowedUserOrigin(req)) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed.",
    });
  }

  next();
}

// ======================================================
// OTP LIMIT ERROR
// ======================================================

class OtpLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = "OtpLimitError";
    this.status = 429;
  }
}

// ======================================================
// RESERVE AN OTP REQUEST AT DATABASE LEVEL
//
// This enforces:
// - Maximum 5 requests per rolling 24 hours
// - Minimum 60 seconds between requests
//
// The operation is atomic for each user document.
// ======================================================

async function reserveEmailOtpRequest(db, userId) {
  const now = new Date();

  const dayCutoff = new Date(
    now.getTime() - OTP_WINDOW_MS
  );

  const cooldownCutoff = new Date(
    now.getTime() - OTP_COOLDOWN_MS
  );

  const recent24Hours = {
    $filter: {
      input: {
        $ifNull: ["$emailOtpSentAt", []],
      },
      as: "sentAt",
      cond: {
        $gt: ["$$sentAt", dayCutoff],
      },
    },
  };

  const recent60Seconds = {
    $filter: {
      input: {
        $ifNull: ["$emailOtpSentAt", []],
      },
      as: "sentAt",
      cond: {
        $gt: ["$$sentAt", cooldownCutoff],
      },
    },
  };

  // MongoDB checks both restrictions and updates
  // the user document atomically.

  const updatedUser = await db
    .collection("users")
    .findOneAndUpdate(
      {
        _id: userId,
        emailVerified: false,
        isActive: true,

        $expr: {
          $and: [
            {
              $lt: [
                { $size: recent24Hours },
                MAX_EMAIL_OTPS_PER_DAY,
              ],
            },
            {
              $eq: [
                { $size: recent60Seconds },
                0,
              ],
            },
          ],
        },
      },

      [
        {
          $set: {
            emailOtpSentAt: {
              $concatArrays: [
                recent24Hours,
                [now],
              ],
            },
            updatedAt: now,
          },
        },
      ],

      {
        returnDocument: "after",
      }
    );

  if (updatedUser) {
    return updatedUser;
  }

  // ====================================================
  // IDENTIFY WHY THE REQUEST WAS DENIED
  // ====================================================

  const user = await db
    .collection("users")
    .findOne({
      _id: userId,
    });

  if (
    !user ||
    user.emailVerified ||
    !user.isActive
  ) {
    throw new OtpLimitError(
      "Email verification is unavailable."
    );
  }

  const recent = (
    Array.isArray(user.emailOtpSentAt)
      ? user.emailOtpSentAt
      : []
  ).filter(
    (date) =>
      date instanceof Date &&
      date.getTime() > dayCutoff.getTime()
  );

  if (recent.length >= MAX_EMAIL_OTPS_PER_DAY) {
    throw new OtpLimitError(
      "Daily OTP limit reached. Maximum 5 OTP requests are allowed in any 24-hour period."
    );
  }

  throw new OtpLimitError(
    "Please wait at least 60 seconds before requesting another OTP."
  );
}

// ======================================================
// SEND EMAIL USING BREVO HTTPS API
// ======================================================

async function sendVerificationEmail(email, code) {
  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",

      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        sender: {
          name:
            process.env.BREVO_SENDER_NAME ||
            "Jaiswal Vaivaahiki",

          email:
            process.env.BREVO_SENDER_EMAIL,
        },

        to: [{ email }],

        subject:
          "Jaiswal Vaivaahiki - Email Verification OTP",

        textContent:
          `Namaste,\n\n` +
          `Your Jaiswal Vaivaahiki verification OTP is: ${code}\n\n` +
          `This OTP expires in ${EMAIL_OTP_MINUTES} minutes.\n\n` +
          `Do not share this OTP with anyone.\n\n` +
          `If you did not register, ignore this email.`,
      }),

      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    console.error(
      "Brevo verification email failed:",
      response.status,
      errorBody
    );

    throw new Error(
      "Unable to submit verification email."
    );
  }

  // Brevo accepted the request.
  // Actual delivery is a separate event.
  return response.json();
}

// ======================================================
// CREATE A NEW OTP
// ======================================================

async function issueEmailOtp(db, user) {
  // Reserve the quota before creating/sending an OTP.
  await reserveEmailOtpRequest(
    db,
    user._id
  );

  const code = String(
    crypto.randomInt(0, 1000000)
  ).padStart(6, "0");

  const now = new Date();

  const expiresAt = new Date(
    now.getTime() +
    EMAIL_OTP_MINUTES * 60 * 1000
  );

  const verifications = db.collection(
    "userEmailVerifications"
  );

  // Invalidate any old OTP for this account.
  await verifications.deleteMany({
    userId: user._id,
  });

  const result = await verifications.insertOne({
    userId: user._id,

    tokenHash: hashEmailOtp(
      user._id.toString(),
      code
    ),

    attempts: 0,
    createdAt: now,
    expiresAt,
  });

  try {
    await sendVerificationEmail(
      user.emailNormalized,
      code
    );
  } catch (error) {
    // Remove this OTP if the email API fails.
    await verifications.deleteOne({
      _id: result.insertedId,
    });

    throw error;
  }
}

// ======================================================
// REGISTER USER
// POST /api/users/register
// ======================================================

router.post(
  "/register",
  registerLimiter,
  requireAllowedOrigin,
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        mobile,
        password,
      } = req.body || {};

      const name =
        typeof fullName === "string"
          ? fullName.trim()
          : "";

      const emailNormalized =
        normalizeEmail(email);

      const mobileE164 =
        normalizeMobile(mobile);

      // ==================================================
      // VALIDATE INPUT
      // ==================================================

      if (
        name.length < 2 ||
        name.length > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name must contain 2 to 100 characters.",
        });
      }

      if (
        emailNormalized.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          emailNormalized
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a valid email address.",
        });
      }

      if (!mobileE164) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a valid mobile number.",
        });
      }

      if (
        typeof password !== "string" ||
        password.length < 10 ||
        Buffer.byteLength(password, "utf8") > 72
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 10 characters and at most 72 UTF-8 bytes.",
        });
      }

      const db = req.app.locals.db;
      const users = db.collection("users");

      // ==================================================
      // DUPLICATE ACCOUNT CHECK
      // ==================================================

      const existingUser =
        await users.findOne({
          $or: [
            { emailNormalized },
            { mobileE164 },
          ],
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "Email or mobile number is already registered.",
        });
      }

      // ==================================================
      // HASH PASSWORD
      // ==================================================

      const passwordHash =
        await bcrypt.hash(password, 12);

      const now = new Date();

      // ==================================================
      // SAVE USER
      // ==================================================

      const result = await users.insertOne({
        fullName: name,
        emailNormalized,
        mobileE164,
        passwordHash,

        emailVerified: false,
        mobileVerified: false,
        isActive: true,

        role: "user",

        // The server maintains the last 24h
        // OTP request timestamps here.
        emailOtpSentAt: [],

        createdAt: now,
        updatedAt: now,
      });

      // ==================================================
      // ISSUE FIRST VERIFICATION OTP
      // ==================================================

      try {
        await issueEmailOtp(db, {
          _id: result.insertedId,
          emailNormalized,
        });
      } catch (error) {
        console.error(
          "Initial verification email error:",
          error
        );

        return res.status(503).json({
          success: false,
          accountCreated: true,
          message:
            "Account created, but verification email could not be sent. Try Resend OTP.",
        });
      }

      return res.status(201).json({
        success: true,
        requiresEmailVerification: true,

        message:
          "Account created. Check your email for the verification OTP.",
      });

    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "Email or mobile number is already registered.",
        });
      }

      console.error(
        "User registration error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Registration failed.",
      });
    }
  }
);

// ======================================================
// VERIFY EMAIL OTP
// POST /api/users/verify-email
// ======================================================

router.post(
  "/verify-email",
  verificationLimiter,
  requireAllowedOrigin,
  async (req, res) => {
    try {
      const email = normalizeEmail(
        req.body?.email
      );

      const otp = req.body?.otp;

      if (
        !email ||
        email.length > 254 ||
        typeof otp !== "string" ||
        !/^\d{6}$/.test(otp)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid email and six-digit OTP required.",
        });
      }

      const db = req.app.locals.db;
      const users = db.collection("users");

      const user = await users.findOne({
        emailNormalized: email,
      });

      if (
        !user ||
        user.emailVerified ||
        !user.isActive
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid verification request.",
        });
      }

      const verifications = db.collection(
        "userEmailVerifications"
      );

      // ==================================================
      // ATOMICALLY COUNT INCORRECT ATTEMPTS
      // ==================================================

      const verification =
        await verifications.findOneAndUpdate(
          {
            userId: user._id,

            expiresAt: {
              $gt: new Date(),
            },

            attempts: {
              $lt: MAX_OTP_ATTEMPTS,
            },
          },

          {
            $inc: {
              attempts: 1,
            },
          },

          {
            returnDocument: "after",
          }
        );

      if (!verification) {
        return res.status(401).json({
          success: false,
          message:
            "OTP expired, invalid or locked. Request a new OTP.",
        });
      }

      // ==================================================
      // HASH AND COMPARE OTP
      // ==================================================

      const suppliedHash = Buffer.from(
        hashEmailOtp(
          user._id.toString(),
          otp
        ),
        "hex"
      );

      const expectedHash = Buffer.from(
        verification.tokenHash,
        "hex"
      );

      const isValid =
        crypto.timingSafeEqual(
          suppliedHash,
          expectedHash
        );

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid OTP. Maximum 5 attempts per code.",
        });
      }

      // ==================================================
      // CONSUME OTP
      // ==================================================

      const consumed =
        await verifications.deleteOne({
          _id: verification._id,
          tokenHash: verification.tokenHash,
        });

      if (consumed.deletedCount !== 1) {
        return res.status(401).json({
          success: false,
          message:
            "OTP already used or invalid.",
        });
      }

      // ==================================================
      // MARK EMAIL AS VERIFIED
      // ==================================================

      await users.updateOne(
        {
          _id: user._id,
          emailVerified: false,
        },

        {
          $set: {
            emailVerified: true,
            emailVerifiedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      return res.json({
        success: true,
        message:
          "Email verified successfully. You can now log in.",
      });

    } catch (error) {
      console.error(
        "Email verification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to verify email.",
      });
    }
  }
);

// ======================================================
// RESEND VERIFICATION OTP
// POST /api/users/resend-verification
// ======================================================

router.post(
  "/resend-verification",
  resendLimiter,
  requireAllowedOrigin,
  async (req, res) => {
    try {
      const email = normalizeEmail(
        req.body?.email
      );

      if (
        !email ||
        email.length > 254
      ) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid email.",
        });
      }

      const db = req.app.locals.db;

      const user = await db
        .collection("users")
        .findOne({
          emailNormalized: email,
          emailVerified: false,
          isActive: true,
        });

      // Respond generically if the email
      // does not belong to an eligible account.
      if (!user) {
        return res.json({
          success: true,
          message:
            "If this account is eligible, an OTP will be sent.",
        });
      }

      // ==================================================
      // ENFORCE COOLDOWN + DAILY LIMIT
      // ==================================================

      try {
        await issueEmailOtp(db, user);
      } catch (error) {
        if (error instanceof OtpLimitError) {
          return res.status(429).json({
            success: false,
            message: error.message,
          });
        }

        throw error;
      }

      return res.json({
        success: true,
        message:
          "Verification OTP request accepted. Check your email.",
      });

    } catch (error) {
      console.error(
        "Resend verification error:",
        error
      );

      return res.status(503).json({
        success: false,
        message:
          "Unable to process verification request.",
      });
    }
  }
);

// ======================================================
// USER LOGIN: EMAIL OR MOBILE + PASSWORD
// POST /api/users/login
// ======================================================

router.post(
  "/login",
  loginLimiter,
  requireAllowedOrigin,
  async (req, res) => {
    try {
      const {
        identifier,
        password,
      } = req.body || {};

      if (
        typeof identifier !== "string" ||
        identifier.length > 254 ||
        typeof password !== "string" ||
        password.length > 200
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid login request.",
        });
      }

      const cleanedIdentifier =
        identifier.trim();

      const query =
        cleanedIdentifier.includes("@")
          ? {
              emailNormalized:
                normalizeEmail(cleanedIdentifier),
            }
          : {
              mobileE164:
                normalizeMobile(cleanedIdentifier),
            };

      const lookupValue =
        query.emailNormalized ??
        query.mobileE164;

      if (!lookupValue) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid login credentials.",
        });
      }

      const db = req.app.locals.db;

      const user = await db
        .collection("users")
        .findOne(query);

      // A valid bcrypt hash for timing work
      // when the account does not exist.
      const fallbackHash =
        "$2b$12$abcdefghijklmnopqrstuuJd89Sl1LM4O6IH9.mSWBQhbrJO7.ESe";

      const passwordValid =
        await bcrypt.compare(
          password,
          user?.passwordHash || fallbackHash
        );

      if (!user || !passwordValid) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid login credentials.",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message:
            "This account is unavailable.",
        });
      }

      if (!user.emailVerified) {
        return res.status(403).json({
          success: false,
          requiresEmailVerification: true,
          message:
            "Verify your email before logging in.",
        });
      }

      // ==================================================
      // CREATE USER SESSION
      // ==================================================

      const token = randomUserToken();

      const csrfToken =
        createUserCsrfToken(token);

      const sessionDuration =
        USER_SESSION_DAYS *
        24 * 60 * 60 * 1000;

      await db
        .collection("userSessions")
        .insertOne({
          tokenHash: hashUserToken(token),
          userId: user._id,
          createdAt: new Date(),
          expiresAt: new Date(
            Date.now() + sessionDuration
          ),
        });

      res.cookie(
        USER_COOKIE_NAME,
        token,
        {
          ...userCookieOptions(),
          maxAge: sessionDuration,
        }
      );

      return res.json({
        success: true,
        message: "Login successful.",
        csrfToken,

        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.emailNormalized,
          mobile: user.mobileE164,
          role: "user",
        },
      });

    } catch (error) {
      console.error(
        "User login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to log in.",
      });
    }
  }
);

// ======================================================
// GET CURRENT USER SESSION
// GET /api/users/me
// ======================================================

router.get(
  "/me",
  userAuth,
  (req, res) => {
    return res.json({
      success: true,
      user: req.user,
      csrfToken: createUserCsrfToken(
        req.userSessionToken
      ),
    });
  }
);

// ======================================================
// USER LOGOUT
// POST /api/users/logout
// ======================================================

router.post(
  "/logout",
  userAuth,
  requireUserCsrf,
  async (req, res) => {
    try {
      await req.app.locals.db
        .collection("userSessions")
        .deleteOne({
          tokenHash:
            req.userSessionTokenHash,
        });

      res.clearCookie(
        USER_COOKIE_NAME,
        userCookieOptions()
      );

      return res.json({
        success: true,
        message:
          "Logged out successfully.",
      });

    } catch (error) {
      console.error(
        "User logout error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Logout failed.",
      });
    }
  }
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;
