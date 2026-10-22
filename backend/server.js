// backend/ server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { MongoClient } = require("mongodb");



const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const {
  ensureAdminIndexes,
} = require("./utils/adminSecurity");


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



app.use(helmet());


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://jaiswal-vaivaahiki.netlify.app",
      "https://jaiswal-vaivaahiki.com",
      "https://www.jaiswal-vaivaahiki.com",
    ],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "X-Admin-CSRF",
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
  })
);


app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());




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
  await ensureAdminIndexes(db);


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




const requiredSecurityVariables = [
  "MONGODB_URI",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD_HASH",
  "ADMIN_EMAIL",
  "OTP_SECRET",
  "BREVO_API_KEY",
  "BREVO_SENDER_EMAIL",
  "BREVO_SENDER_NAME",
];


for (const name of requiredSecurityVariables) {
  if (!process.env[name]) {
    throw new Error(
      `Required environment variable missing: ${name}`
    );
  }
}



// ======================================================
// START APPLICATION
// ======================================================

startServer();
