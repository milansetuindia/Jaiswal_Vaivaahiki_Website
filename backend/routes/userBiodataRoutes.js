
const express = require("express");
const multer = require("multer");

const {
  userAuth,
  requireUserCsrf,
} = require("../middleware/userAuth");

const {
  submitUserBiodata,
  getMyBiodata,
} = require("../controllers/userBiodataController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    files: 2,
    fileSize: 10 * 1024 * 1024,
    fields: 25,
  },

  fileFilter(req, file, cb) {
    if (
      file.fieldname === "photo" &&
      ["image/jpeg", "image/png", "image/webp"]
        .includes(file.mimetype)
    ) {
      return cb(null, true);
    }

    if (
      file.fieldname === "biodataPdf" &&
      file.mimetype === "application/pdf"
    ) {
      return cb(null, true);
    }

    cb(new Error("Invalid file type."));
  },
});

// ======================================================
// CHECK OWN SUBMISSION
// ======================================================

router.get(
  "/me",
  userAuth,
  getMyBiodata
);

// ======================================================
// ADD BIODATA - ONE PER ACCOUNT
// ======================================================

router.post(
  "/",
  userAuth,
  requireUserCsrf,

  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "biodataPdf", maxCount: 1 },
  ]),

  submitUserBiodata
);

// ======================================================
// FILE UPLOAD ERRORS
// ======================================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message ||
        "File upload rejected.",
    });
  }

  next();
});

module.exports = router;
