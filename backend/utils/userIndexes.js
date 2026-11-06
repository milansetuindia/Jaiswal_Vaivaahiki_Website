
const { ObjectId } = require("mongodb");

// ======================================================
// USER DATABASE INDEXES
// ======================================================

async function ensureUserIndexes(db) {
  const users = db.collection("users");

  // Each registered email must be unique.
  await users.createIndex(
    { emailNormalized: 1 },
    {
      unique: true,
      name: "unique_user_email",
    }
  );

  // Each registered mobile number must be unique.
  await users.createIndex(
    { mobileE164: 1 },
    {
      unique: true,
      name: "unique_user_mobile",
    }
  );

  // ====================================================
  // USER SESSIONS
  // ====================================================

  const userSessions = db.collection("userSessions");

  // Prevent duplicate session tokens.
  await userSessions.createIndex(
    { tokenHash: 1 },
    {
      unique: true,
      name: "unique_user_session_token",
    }
  );

  // Automatically remove expired sessions.
  await userSessions.createIndex(
    { expiresAt: 1 },
    {
      expireAfterSeconds: 0,
      name: "user_session_expiry",
    }
  );

  // ====================================================
  // EMAIL VERIFICATION
  // ====================================================

  const emailVerifications = db.collection(
    "userEmailVerifications"
  );

  await emailVerifications.createIndex(
    { tokenHash: 1 },
    {
      unique: true,
      name: "unique_email_verification_token",
    }
  );

  await emailVerifications.createIndex(
    { expiresAt: 1 },
    {
      expireAfterSeconds: 0,
      name: "email_verification_expiry",
    }
  );

  // ====================================================
  // ONE BIODATA PER USER ACCOUNT
  // ====================================================

  const biodatas = db.collection("biodatas");

  await biodatas.createIndex(
    { submittedByUserId: 1 },
    {
      unique: true,
      name: "one_biodata_per_user",
      partialFilterExpression: {
        submittedByUserId: {
          $type: "objectId",
        },
      },
    }
  );

  console.log(
    "User database indexes initialized successfully"
  );
}

module.exports = {
  ensureUserIndexes,
};
