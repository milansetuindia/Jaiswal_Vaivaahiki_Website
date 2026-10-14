
  // backend/routes/adminRoutes.js

  const express = require("express");
  const bcrypt = require("bcryptjs");
  const crypto = require("crypto");
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

  // ======================================================
  // CREATE CSRF TOKEN
  // ======================================================

  function createCsrfToken(sessionToken) {
    return crypto
      .createHmac("sha256", process.env.OTP_SECRET)
      .update(`csrf:${sessionToken}`)
      .digest("hex");
  }

  // ======================================================
  // LOGIN RATE LIMITING
  // ======================================================

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

  // ======================================================
  // OTP VERIFICATION RATE LIMITING
  // ======================================================

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

  // ======================================================
  // SEND ADMIN OTP USING BREVO HTTPS API
  // WORKS WITH RENDER FREE
  // REQUIRES NODE.JS 18+
  // ======================================================

  async function sendAdminOtpEmail(code) {
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

            email: process.env.BREVO_SENDER_EMAIL,
          },

          to: [
            {
              email: process.env.ADMIN_EMAIL,
            },
          ],

          subject:
            "Jaiswal Vaivaahiki - Admin Login OTP",

          textContent:
            `🙏 Namaste,\n\n` +
            `Your Jaiswal Vaivaahiki Admin Login OTP is: ${code}\n\n` +
            `This code will expire in ${OTP_MINUTES} minutes.\n\n` +
            "Do not share this OTP with anyone.\n\n" +
            "If you did not request this login, " +
            "please secure your administrator account.",
        }),

        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();

      console.error(
        "Brevo OTP email failed:",
        response.status,
        errorBody
      );

      throw new Error(
        "Failed to send admin OTP email"
      );
    }

    // API accepted the message.
    // Actual inbox delivery must be checked separately.
    return await response.json();
  }

  // ======================================================
  // VALIDATE FRONTEND ORIGIN
  // ======================================================

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

  router.post(
    "/login",
    loginLimiter,
    async (req, res) => {
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

        // ==================================================
        // VERIFY USERNAME
        // ==================================================

        const correctUsername =
          username === process.env.ADMIN_USERNAME;

        // ==================================================
        // VERIFY HASHED PASSWORD
        // ==================================================

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

        // ==================================================
        // GENERATE SIX-DIGIT OTP
        // ==================================================

        const challengeId = randomToken(24);

        const code = String(
          crypto.randomInt(0, 1000000)
        ).padStart(6, "0");

        const expiresAt = new Date(
          Date.now() + OTP_MINUTES * 60 * 1000
        );

        // ==================================================
        // INVALIDATE PREVIOUS OTP CHALLENGES
        // ==================================================

        await db
          .collection("adminChallenges")
          .deleteMany({
            username,
          });

        // ==================================================
        // SAVE HASHED OTP IN MONGODB
        // ==================================================

        await db
          .collection("adminChallenges")
          .insertOne({
            _id: challengeId,
            username,
            otpHash: hashOtp(challengeId, code),
            attempts: 0,
            expiresAt,
            createdAt: new Date(),
          });

        // ==================================================
        // SEND OTP THROUGH BREVO HTTPS API
        // ==================================================

        try {
          await sendAdminOtpEmail(code);

        } catch (mailError) {
          // Remove challenge if email submission fails.

          await db
            .collection("adminChallenges")
            .deleteOne({
              _id: challengeId,
            });

          throw mailError;
        }

        // ==================================================
        // OTP SENT SUCCESSFULLY
        // ==================================================

        return res.json({
          success: true,
          requiresOtp: true,
          challengeId,
          message:
            "Verification code sent to admin email.",
        });

      } catch (error) {
        console.error(
          "Admin login error:",
          error
        );

        return res.status(500).json({
          success: false,
          message: "Unable to process login.",
        });
      }
    }
  );

  // ======================================================
  // STEP 2: VERIFY OTP AND CREATE ADMIN SESSION
  // ======================================================

  router.post(
    "/verify-otp",
    otpLimiter,
    async (req, res) => {
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

        const challenges =
          db.collection("adminChallenges");

        // ==================================================
        // VALIDATE OTP CHALLENGE AND COUNT ATTEMPT
        // ==================================================

        const challenge =
          await challenges.findOneAndUpdate(
            {
              _id: challengeId,
              expiresAt: {
                $gt: new Date(),
              },
              attempts: {
                $lt: 5,
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

        if (!challenge) {
          return res.status(401).json({
            success: false,
            message:
              "OTP invalid, expired or locked.",
          });
        }

        // ==================================================
        // COMPARE OTP SECURELY
        // ==================================================

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

        // ==================================================
        // CONSUME OTP (PREVENT REUSE)
        // ==================================================

        const consumed =
          await challenges.deleteOne({
            _id: challengeId,
            otpHash: challenge.otpHash,
          });

        if (consumed.deletedCount !== 1) {
          return res.status(401).json({
            success: false,
            message: "OTP already used.",
          });
        }

        // ==================================================
        // GENERATE SECURE ADMIN SESSION
        // ==================================================

        const token = randomToken();

        const csrfToken = createCsrfToken(token);

        const sessionDuration =
          SESSION_HOURS * 60 * 60 * 1000;

        // ==================================================
        // SAVE SESSION IN MONGODB
        // ==================================================

        await db
          .collection("adminSessions")
          .insertOne({
            tokenHash: sha256(token),
            csrfHash: sha256(csrfToken),
            username: challenge.username,
            role: "admin",
            createdAt: new Date(),
            expiresAt: new Date(
              Date.now() + sessionDuration
            ),
          });

        // ==================================================
        // SEND SECURE SESSION COOKIE
        // ==================================================

        res.cookie(
          COOKIE_NAME,
          token,
          {
            ...cookieOptions(),
            maxAge: sessionDuration,
          }
        );

        // ==================================================
        // LOGIN SUCCESS
        // ==================================================

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
        console.error(
          "OTP verification error:",
          error
        );

        return res.status(500).json({
          success: false,
          message: "OTP verification failed.",
        });
      }
    }
  );

  // ======================================================
  // CHECK EXISTING ADMIN SESSION
  // ======================================================

  router.get(
    "/me",
    adminAuth,
    (req, res) => {
      return res.json({
        success: true,
        csrfToken: createCsrfToken(
          req.sessionToken
        ),
        admin: req.admin,
      });
    }
  );

  // ======================================================
  // ADMIN LOGOUT
  // ======================================================

  router.post(
    "/logout",
    adminAuth,
    async (req, res) => {
      try {
        // ==================================================
        // DELETE SESSION FROM MONGODB
        // ==================================================

        await req.app.locals.db
          .collection("adminSessions")
          .deleteOne({
            tokenHash: req.sessionTokenHash,
          });

        // ==================================================
        // CLEAR SESSION COOKIE
        // ==================================================

        res.clearCookie(
          COOKIE_NAME,
          cookieOptions()
        );

        return res.json({
          success: true,
          message:
            "Logged out successfully.",
        });

      } catch (error) {
        console.error(
          "Admin logout error:",
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
  // EXPORT ROUTER
  // ======================================================

  module.exports = router;
