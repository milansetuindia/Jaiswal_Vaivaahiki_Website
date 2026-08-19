const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { MongoClient } = require("mongodb");

// ======================================================
// LOAD ENVIRONMENT VARIABLES
// ======================================================

dotenv.config();

// ======================================================
// LOAD ROUTES / CONTROLLERS
// ======================================================

const biodataRoutes = require("./routes/biodataRoutes");

const {
  cleanupExpiredBiodatas,
} = require("./controllers/biodataController");

const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// ======================================================
// JSON
// ======================================================

app.use(express.json());

// ======================================================
// UPLOADS
// ======================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// ======================================================
// DATABASE
// ======================================================

let db;

async function connectDatabase() {
  try {
    const client = new MongoClient(
      MONGODB_URI
    );

    await client.connect();

    db = client.db(
      "JaiswalVaivaahiki"
    );

    app.locals.db = db;

    console.log(
      "MongoDB connected successfully"
    );

    console.log(
      "Database: JaiswalVaivaahiki"
    );

  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
}

// ======================================================
// ROOT API
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Jaiswal Vaivaahiki backend is running",
  });
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message:
      "Jaiswal Vaivaahiki API is working",
    database: db
      ? "connected"
      : "not connected",
  });
});

// ======================================================
// ROUTES
// ======================================================

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/biodatas",
  biodataRoutes
);

// ======================================================
// START SERVER
// ======================================================

async function startServer() {
  await connectDatabase();

  // ====================================================
  // AUTOMATIC 6-MONTH BIODATA CLEANUP
  // ====================================================

  // Run cleanup once when the server starts
  console.log(
    "Running initial 6-month biodata cleanup..."
  );

  await cleanupExpiredBiodatas(db);

  // Run cleanup automatically every 24 hours
  setInterval(
    async () => {
      console.log(
        "Running scheduled 6-month biodata cleanup..."
      );

      await cleanupExpiredBiodatas(db);
    },
    24 * 60 * 60 * 1000
  );

  // ====================================================
  // START EXPRESS SERVER
  // ====================================================

  app.listen(PORT, () => {
    console.log(
      `Jaiswal Vaivaahiki backend running on port ${PORT}`
    );

    console.log(
      "Automatic 6-month biodata cleanup is enabled."
    );
  });
}

// ======================================================
// START APPLICATION
// ======================================================

startServer();