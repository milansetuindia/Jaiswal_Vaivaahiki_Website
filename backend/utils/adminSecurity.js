
const crypto = require("crypto");

const SESSION_HOURS = 2;
const OTP_MINUTES = 5;

const isProduction =
  process.env.NODE_ENV === "production";

const COOKIE_NAME = isProduction
  ? "__Host-jv_admin"
  : "jv_admin_dev";

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

function hashOtp(challengeId, code) {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`${challengeId}:${code}`)
    .digest("hex");
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
}

async function ensureAdminIndexes(db) {
  await db.collection("adminChallenges").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );

  await db.collection("adminSessions").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );

  await db.collection("adminSessions").createIndex(
    { tokenHash: 1 },
    { unique: true }
  );
}

module.exports = {
  COOKIE_NAME,
  SESSION_HOURS,
  OTP_MINUTES,
  randomToken,
  sha256,
  hashOtp,
  cookieOptions,
  ensureAdminIndexes,
};
