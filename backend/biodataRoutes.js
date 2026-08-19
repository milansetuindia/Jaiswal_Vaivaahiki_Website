// backend/routes/biodataRoutes.js

const express = require("express");
const multer = require("multer");

const adminAuth = require("../middleware/adminAuth");

const {
  uploadBiodata,
  getAllBiodatas,
  getBiodataById,
  deleteBiodata,
  updateBiodata,
} = require("../controllers/biodataController");

const router = express.Router();

// ======================================================
// MULTER MEMORY STORAGE
// ======================================================
//
// Files are temporarily stored in memory.
// They will then be uploaded directly to Cloudinary.
//
// Nothing new is permanently stored in:
// backend/uploads
//
// ======================================================

const storage = multer.memoryStorage();

// ======================================================
// MULTER CONFIGURATION
// ======================================================

const upload = multer({
  storage,

  limits: {
    files: 2,
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: function (req, file, cb) {
    // ====================================================
    // PROFILE PHOTO
    // ====================================================

    if (file.fieldname === "photo") {
      if (file.mimetype.startsWith("image/")) {
        return cb(null, true);
      }

      return cb(
        new Error("Photo must be an image")
      );
    }

    // ====================================================
    // BIODATA PDF
    // ====================================================

    if (file.fieldname === "biodataPdf") {
      if (file.mimetype === "application/pdf") {
        return cb(null, true);
      }

      return cb(
        new Error("Biodata must be a PDF")
      );
    }

    // ====================================================
    // INVALID FIELD
    // ====================================================

    return cb(
      new Error("Invalid file field")
    );
  },
});

// ======================================================
// UPLOAD NEW BIODATA
// ======================================================

router.post(
  "/upload",

  adminAuth,

  upload.fields([
    {
      name: "photo",
      maxCount: 1,
    },
    {
      name: "biodataPdf",
      maxCount: 1,
    },
  ]),

  uploadBiodata
);

// ======================================================
// GET ALL BIODATAS
// ======================================================

router.get(
  "/",
  getAllBiodatas
);

// ======================================================
// DELETE BIODATA
// ======================================================

router.delete(
  "/:id",

  adminAuth,

  deleteBiodata
);

// ======================================================
// UPDATE / EDIT BIODATA
// ======================================================

router.put(
  "/:id",

  adminAuth,

  upload.fields([
    {
      name: "photo",
      maxCount: 1,
    },
    {
      name: "biodataPdf",
      maxCount: 1,
    },
  ]),

  updateBiodata
);

// ======================================================
// GET BIODATA BY ID
// ======================================================

router.get(
  "/:id",
  getBiodataById
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;