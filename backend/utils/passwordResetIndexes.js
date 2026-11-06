
async function ensurePasswordResetIndexes(db) {
  const collection = db.collection(
    "userPasswordResets"
  );

  // Only one active reset record per account.
  await collection.createIndex(
    {
      userId: 1,
    },
    {
      unique: true,
    }
  );

  // Automatically clear expired OTP records.
  await collection.createIndex(
    {
      expiresAt: 1,
    },
    {
      expireAfterSeconds: 0,
    }
  );

  console.log(
    "Password reset indexes initialized successfully"
  );
}

module.exports = {
  ensurePasswordResetIndexes,
};
