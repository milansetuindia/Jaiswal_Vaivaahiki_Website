
const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { rateLimit } = require("express-rate-limit");

const router = express.Router();

// ======================================================
// PASSWORD RESET SECURITY SETTINGS
// ======================================================

const MAX_OTPS_PER_DAY = 5;
const OTP_WINDOW_MS = 24 * 60 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;
const OTP_VALIDITY_MS = 10 * 60 * 1000;
const MAX_WRONG_ATTEMPTS = 5;

// ======================================================
// TRUSTED FRONTEND ORIGINS
// ======================================================

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://jaiswal-vaivaahiki.netlify.app",
  "https://jaiswal-vaivaahiki.com",
  "https://www.jaiswal-vaivaahiki.com",
]);

function checkOrigin(req, res, next) {
  const origin = req.get("origin");

  if (!allowedOrigins.has(origin)) {
    return res.status(403).json({
      success: false,
      message: "Request origin not allowed.",
    });
  }

  next();
}

// ======================================================
// IP-BASED RATE LIMITS
// ======================================================

const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many password reset requests. Try later.",
  },
});

const confirmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many verification attempts. Try later.",
  },
});

// ======================================================
// EMAIL NORMALIZATION
// ======================================================

function normalizeEmail(value) {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

// ======================================================
// HASH OTP WITH SERVER SECRET
// ======================================================

function hashOtp(userId, otp) {
  return crypto
    .createHmac(
      "sha256",
      process.env.OTP_SECRET
    )
    .update(
      `password-reset:${userId.toString()}:${otp}`
    )
    .digest("hex");
}

// ======================================================
// SAFE HASH COMPARISON
// ======================================================

function compareHashes(a, b) {
  if (
    typeof a !== "string" ||
    typeof b !== "string" ||
    !/^[a-f0-9]{64}$/.test(a) ||
    !/^[a-f0-9]{64}$/.test(b)
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(a, "hex"),
    Buffer.from(b, "hex")
  );
}

// ======================================================
// ATOMIC 5 OTP / ROLLING 24 HOURS LIMIT
// PLUS 60 SECOND COOLDOWN
// ======================================================

async function reserveOtpQuota(db, userId) {
  const now = new Date();

  const dayCutoff = new Date(
    now.getTime() - OTP_WINDOW_MS
  );

  const cooldownCutoff = new Date(
    now.getTime() - OTP_COOLDOWN_MS
  );

  const recentOtps = {
    $filter: {
      input: {
        $ifNull: [
          "$passwordResetOtpSentAt",
          [],
        ],
      },
      as: "sentAt",
      cond: {
        $gt: [
          "$$sentAt",
          dayCutoff,
        ],
      },
    },
  };

  const recentCooldownOtps = {
    $filter: {
      input: {
        $ifNull: [
          "$passwordResetOtpSentAt",
          [],
        ],
      },
      as: "sentAt",
      cond: {
        $gt: [
          "$$sentAt",
          cooldownCutoff,
        ],
      },
    },
  };

  const result = await db
    .collection("users")
    .updateOne(
      {
        _id: userId,
        emailVerified: true,
        isActive: true,

        $expr: {
          $and: [
            {
              $lt: [
                {
                  $size: recentOtps,
                },
                MAX_OTPS_PER_DAY,
              ],
            },
            {
              $eq: [
                {
                  $size: recentCooldownOtps,
                },
                0,
              ],
            },
          ],
        },
      },

      [
        {
          $set: {
            passwordResetOtpSentAt: {
              $concatArrays: [
                recentOtps,
                [now],
              ],
            },
            updatedAt: now,
          },
        },
      ]
    );

  return result.modifiedCount === 1;
}

// ======================================================
// SEND RESET OTP THROUGH BREVO
// ======================================================

async function sendResetEmail(email, otp) {
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

        to: [
          {
            email,
          },
        ],

        subject:
          "Jaiswal Vaivaahiki - Reset Password OTP",

        textContent:
          `Namaste,\n\n` +
          `Your password reset OTP is: ${otp}\n\n` +
          `This OTP is valid for 10 minutes.\n` +
          `Do not share this OTP with anyone.\n\n` +
          `If you did not request a password reset, ignore this email.\n\n` +
          `Jaiswal Vaivaahiki`,
      }),

      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    console.error(
      "Brevo password reset email error:",
      response.status
    );

    throw new Error(
      "Brevo did not accept the reset email."
    );
  }
}

// ======================================================
// GENERIC RESPONSE TO PREVENT ACCOUNT DISCOVERY
// ======================================================

function genericRequestResponse(res) {
  return res.json({
    success: true,
    message:
      "If this is a verified registered email and the OTP limit allows it, a reset code will be sent. Check your inbox and spam folder.",
  });
}

// ======================================================
// REQUEST PASSWORD RESET OTP
// POST /api/users/password-reset/request
// ======================================================

router.post(
  "/request",
  checkOrigin,
  requestLimiter,

  async (req, res) => {
    try {
      const email = normalizeEmail(
        req.body?.email
      );

      if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a valid email address.",
        });
      }

      const db = req.app.locals.db;

      const user = await db
        .collection("users")
        .findOne({
          emailNormalized: email,
          emailVerified: true,
          isActive: true,
        });

      // Do not reveal whether an account exists.
      if (!user) {
        return genericRequestResponse(res);
      }

      // Atomically enforce five OTP requests
      // per rolling 24 hours and 60s cooldown.
      const quotaGranted =
        await reserveOtpQuota(
          db,
          user._id
        );

      if (!quotaGranted) {
        return genericRequestResponse(res);
      }

      const otp = String(
        crypto.randomInt(0, 1000000)
      ).padStart(6, "0");

      const tokenHash = hashOtp(
        user._id,
        otp
      );

      const now = new Date();

      const expiresAt = new Date(
        now.getTime() + OTP_VALIDITY_MS
      );

      const resets = db.collection(
        "userPasswordResets"
      );

      // One active OTP per user.
      // A newly issued OTP invalidates the old one.
      await resets.updateOne(
        {
          userId: user._id,
        },
        {
          $set: {
            tokenHash,
            attempts: 0,
            createdAt: now,
            expiresAt,
          },
        },
        {
          upsert: true,
        }
      );

      try {
        await sendResetEmail(
          email,
          otp
        );
      } catch (emailError) {
        // Invalidate the failed OTP without
        // deleting a newer concurrent OTP.
        await resets.deleteOne({
          userId: user._id,
          tokenHash,
        });

        console.error(
          "Password reset email failed:",
          emailError.message
        );
      }

      // The reserved quota is intentionally
      // not refunded after an email failure.
      return genericRequestResponse(res);

    } catch (error) {
      console.error(
        "Password reset request error:",
        error
      );

      return res.status(503).json({
        success: false,
        message:
          "Unable to process the request right now.",
      });
    }
  }
);

// ======================================================
// CONFIRM OTP AND CHANGE PASSWORD
// POST /api/users/password-reset/confirm
// ======================================================

router.post(
  "/confirm",
  checkOrigin,
  confirmLimiter,

  async (req, res) => {
    try {
      const email = normalizeEmail(
        req.body?.email
      );

      const otp = req.body?.otp;

      const newPassword =
        req.body?.newPassword;

      if (
        !email ||
        email.length > 254 ||
        typeof otp !== "string" ||
        !/^\d{6}$/.test(otp)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid email and six-digit OTP are required.",
        });
      }

      if (
        typeof newPassword !== "string" ||
        newPassword.length < 10 ||
        Buffer.byteLength(
          newPassword,
          "utf8"
        ) > 72
      ) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be at least 10 characters and at most 72 UTF-8 bytes.",
        });
      }

      const db = req.app.locals.db;

      const users = db.collection("users");

      const user = await users.findOne({
        emailNormalized: email,
        emailVerified: true,
        isActive: true,
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid or expired OTP.",
        });
      }

      const resets = db.collection(
        "userPasswordResets"
      );

      // Count verification attempts atomically.
      const reset = await resets
        .findOneAndUpdate(
          {
            userId: user._id,

            expiresAt: {
              $gt: new Date(),
            },

            attempts: {
              $lt: MAX_WRONG_ATTEMPTS,
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

      if (!reset) {
        return res.status(401).json({
          success: false,
          message:
            "OTP expired or locked. Request a new OTP when permitted.",
        });
      }

      const suppliedHash = hashOtp(
        user._id,
        otp
      );

      if (
        !compareHashes(
          suppliedHash,
          reset.tokenHash
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Incorrect OTP. Maximum 5 attempts per code.",
        });
      }

      // Hash the new password BEFORE consuming
      // the valid, single-use OTP.
      const passwordHash =
        await bcrypt.hash(
          newPassword,
          12
        );

      // Only one request can consume this OTP.
      const consumed =
        await resets.findOneAndDelete({
          _id: reset._id,
          tokenHash: reset.tokenHash,
          expiresAt: {
            $gt: new Date(),
          },
        });

      if (!consumed) {
        return res.status(401).json({
          success: false,
          message:
            "OTP already used or expired.",
        });
      }

      // Change password in the users collection.
      const updated = await users.updateOne(
        {
          _id: user._id,
          emailVerified: true,
          isActive: true,
        },

        {
          $set: {
            passwordHash,
            passwordChangedAt:
              new Date(),
            updatedAt: new Date(),
          },
        }
      );

      if (updated.matchedCount !== 1) {
        return res.status(503).json({
          success: false,
          message:
            "Password could not be changed.",
        });
      }

      // Logout all existing user sessions.
      await db
        .collection("userSessions")
        .deleteMany({
          userId: user._id,
        });

      return res.json({
        success: true,
        message:
          "Password reset successful. Please log in with your new password.",
      });

    } catch (error) {
      console.error(
        "Confirm password reset error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to reset password right now.",
      });
    }
  }
);

module.exports = router;
