
const path = require("path");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

async function assignProfileNumbers() {
  const client = new MongoClient(
    process.env.MONGODB_URI
  );

  try {
    await client.connect();

    const db = client.db("JaiswalVaivaahiki");
    const biodatas = db.collection("biodatas");
    const counters = db.collection("counters");

    // Prevent accidental reassignment on a second run.
    const alreadyNumbered = await biodatas.findOne({
      profileNumber: { $exists: true },
    });

    if (alreadyNumbered) {
      throw new Error(
        "Some profiles already have numbers. " +
        "Migration stopped to avoid changing existing IDs."
      );
    }

    // Oldest profiles receive the first numbers.
    const profiles = await biodatas
      .find({}, { projection: { _id: 1 } })
      .sort({ createdAt: 1, _id: 1 })
      .toArray();

    let sequence = 0;

    for (const profile of profiles) {
      sequence++;

      const profileNumber =
        `JV-${String(sequence).padStart(3, "0")}`;

      await biodatas.updateOne(
        { _id: profile._id },
        { $set: { profileNumber } }
      );

      console.log(
        `${profile._id} -> ${profileNumber}`
      );
    }

    // Initialize the counter for future profiles.
    await counters.updateOne(
      { _id: "biodataProfileNumber" },
      { $set: { sequence } },
      { upsert: true }
    );

    // Enforce unique non-empty profile numbers.
    await biodatas.createIndex(
      { profileNumber: 1 },
      {
        unique: true,
        partialFilterExpression: {
          profileNumber: { $type: "string" },
        },
      }
    );

    console.log(
      `Completed. Numbered ${sequence} profiles.`
    );

  } finally {
    await client.close();
  }
}

assignProfileNumbers().catch((error) => {
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
