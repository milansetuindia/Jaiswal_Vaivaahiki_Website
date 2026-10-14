
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { rateLimit } = require("express-rate-limit");

const adminAuth = require("../middleware/adminAuth");

const {
  COOKIE_NAME,
  SESSION_HOURS,
  OTP_MINUTES,
  randomToken,
  sha256,
  hashOtp,
  cookieOptions,
} = require("../utils/adminSecurity");

const router = express.Router();


function createCsrfToken(sessionToken) {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`csrf:${sessionToken}`)
    .digest("hex");
}



const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Try again later.",
  },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many verification attempts.",
  },
});

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const validOrigin = (req) => {
  const allowed = [
    "https://jaiswal-vaivaahiki.netlify.app",
    "http://localhost:5173",
  ];

  return allowed.includes(req.get("origin"));
};

// ======================================================
// STEP 1: VERIFY ADMIN PASSWORD AND SEND OTP
// ======================================================

router.post("/login", loginLimiter, async (req, res) => {
  try {
    if (!validOrigin(req)) {
      return res.sendStatus(403);
    }

    const { username, password } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username.length > 100 ||
      password.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid login request.",
      });
    }

    const correctUsername =
      username === process.env.ADMIN_USERNAME;

    // Always check password hash to reduce
    // differences in response behavior.
    const correctPassword = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!correctUsername || !correctPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const db = req.app.locals.db;

    const challengeId = randomToken(24);
    const code = String(
      crypto.randomInt(0, 1000000)
    ).padStart(6, "0");

    const expiresAt = new Date(
      Date.now() + OTP_MINUTES * 60 * 1000
    );

    // Invalidate earlier pending challenges.
    await db.collection("adminChallenges").deleteMany({
      username,
    });

    await db.collection("adminChallenges").insertOne({
      _id: challengeId,
      username,
      otpHash: hashOtp(challengeId, code),
      attempts: 0,
      expiresAt,
      createdAt: new Date(),
    });

    try {
      await mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: "Jaiswal Vaivaahiki Admin Login OTP",
        text:
          `Your admin login OTP is ${code}.\n\n` +
          `This code expires in ${OTP_MINUTES} minutes.\n` +
          "Do not share this code with anyone.",
      });
    } catch (mailError) {
      await db.collection("adminChallenges").deleteOne({
        _id: challengeId,
      });
      throw mailError;
    }

    return res.json({
      success: true,
      requiresOtp: true,
      challengeId,
      message: "Verification code sent to admin email.",
    });

  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process login.",
    });
  }
});

// ======================================================
// STEP 2: VERIFY OTP AND CREATE ADMIN SESSION
// ======================================================

router.post("/verify-otp", otpLimiter, async (req, res) => {
  try {
    if (!validOrigin(req)) {
      return res.sendStatus(403);
    }

    const { challengeId, otp } = req.body || {};

    if (
      typeof challengeId !== "string" ||
      !/^[a-f0-9]{48}$/.test(challengeId) ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification request.",
      });
    }

    const db = req.app.locals.db;
    const challenges = db.collection("adminChallenges");

    // Atomically consume one verification attempt.
    const challenge = await challenges.findOneAndUpdate(
      {
        _id: challengeId,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: 5 },
      },
      { $inc: { attempts: 1 } },
      { returnDocument: "after" }
    );

    if (!challenge) {
      return res.status(401).json({
        success: false,
        message: "OTP invalid, expired or locked.",
      });
    }

    const suppliedHash = Buffer.from(
      hashOtp(challengeId, otp),
      "hex"
    );

    const expectedHash = Buffer.from(
      challenge.otpHash,
      "hex"
    );

    const valid = crypto.timingSafeEqual(
      suppliedHash,
      expectedHash
    );

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Only one concurrent verification can consume
    // this challenge and issue a session.
    const consumed = await challenges.deleteOne({
      _id: challengeId,
      otpHash: challenge.otpHash,
    });

    if (consumed.deletedCount !== 1) {
      return res.status(401).json({
        success: false,
        message: "OTP already used.",
      });
    }

    const token = randomToken();
    const csrfToken = createCsrfToken(token);

    const sessionDuration =
      SESSION_HOURS * 60 * 60 * 1000;

    await db.collection("adminSessions").insertOne({
      tokenHash: sha256(token),
      csrfHash: sha256(csrfToken),
      username: challenge.username,
      role: "admin",
      createdAt: new Date(),
      expiresAt: new Date(
        Date.now() + sessionDuration
      ),
    });

    res.cookie(
      COOKIE_NAME,
      token,
      {
        ...cookieOptions(),
        maxAge: sessionDuration,
      }
    );

    return res.json({
      success: true,
      message: "Admin login successful.",
      csrfToken,
      admin: {
        username: challenge.username,
        role: "admin",
      },
    });

  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed.",
    });
  }
});

// ======================================================
// CHECK EXISTING SESSION
// ======================================================

router.get("/me", adminAuth, (req, res) => {
  return res.json({
    success: true,
    csrfToken: createCsrfToken(req.sessionToken),
    admin: req.admin,
  });
});

// ======================================================
// LOGOUT
// ======================================================

router.post("/logout", adminAuth, async (req, res) => {
  try {
    await req.app.locals.db
      .collection("adminSessions")
      .deleteOne({
        tokenHash: req.sessionTokenHash,
      });

    res.clearCookie(COOKIE_NAME, cookieOptions());

    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed.",
    });
  }
});

module.exports = router;



