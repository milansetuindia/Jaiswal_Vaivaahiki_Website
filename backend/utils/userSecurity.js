
const crypto = require("crypto");

// ======================================================
// USER SECURITY SETTINGS
// ======================================================

const USER_COOKIE_NAME = "jv_user_session";

const USER_SESSION_DAYS = 7;

const EMAIL_OTP_MINUTES = 10;

// ======================================================
// SECURE RANDOM TOKEN
// ======================================================

function randomUserToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

// ======================================================
// SHA-256 HASH
// ======================================================

function hashUserToken(value) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

// ======================================================
// EMAIL NORMALIZATION
// ======================================================

function normalizeEmail(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

// ======================================================
// MOBILE NORMALIZATION
// INDIAN NUMBERS DEFAULT TO +91
// INTERNATIONAL NUMBERS MUST INCLUDE +
// ======================================================

function normalizeMobile(value) {
  if (typeof value !== "string") {
    return "";
  }

  const cleaned = value
    .trim()
    .replace(/[\s()-]/g, "");

  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  if (/^\+[1-9]\d{7,14}$/.test(cleaned)) {
    return cleaned;
  }

  return "";
}

// ======================================================
// EMAIL VERIFICATION OTP HASH
// ======================================================

function hashEmailOtp(userId, otp) {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`user-email:${userId}:${otp}`)
    .digest("hex");
}

// ======================================================
// CSRF TOKEN
// ======================================================

function createUserCsrfToken(sessionToken) {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`user-csrf:${sessionToken}`)
    .digest("hex");
}

// ======================================================
// COOKIE SECURITY
// ======================================================

function userCookieOptions() {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
}

// ======================================================
// CHECK REQUEST ORIGIN
// ======================================================

const USER_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://jaiswal-vaivaahiki.netlify.app",
  "https://jaiswal-vaivaahiki.com",
  "https://www.jaiswal-vaivaahiki.com",
];

function isAllowedUserOrigin(req) {
  const origin = req.get("origin");

  return USER_ALLOWED_ORIGINS.includes(origin);
}

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
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
};
