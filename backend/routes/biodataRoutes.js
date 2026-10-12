// backend/routes/biodataRoutes.js

const express = require("express");
const multer = require("multer");


const { ObjectId } = require("mongodb");

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
// GET PRIVATE ADMIN REMARK
// ======================================================

router.get(
  "/:id/admin-remark",
  adminAuth,
  async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { id } = req.params;

      if (!db) {
        return res.status(503).json({
          success: false,
          message: "Database unavailable",
        });
      }

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid biodata ID",
        });
      }

      const biodataId = new ObjectId(id);

      const biodata = await db
        .collection("biodatas")
        .findOne(
          { _id: biodataId },
          { projection: { _id: 1 } }
        );

      if (!biodata) {
        return res.status(404).json({
          success: false,
          message: "Biodata not found",
        });
      }

      const remark = await db
        .collection("adminRemarks")
        .findOne({ biodataId });

      return res.json({
        success: true,
        adminRemark: remark?.text || "",
      });

    } catch (error) {
      console.error("Get admin remark error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load admin remark",
      });
    }
  }
);


// ======================================================
// SAVE / UPDATE PRIVATE ADMIN REMARK
// ======================================================

router.put(
  "/:id/admin-remark",
  adminAuth,
  async (req, res) => {
    try {
      const db = req.app.locals.db;
      const { id } = req.params;
      const { adminRemark } = req.body;

      if (!db) {
        return res.status(503).json({
          success: false,
          message: "Database unavailable",
        });
      }

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid biodata ID",
        });
      }

      if (
        typeof adminRemark !== "string" ||
        adminRemark.length > 2000
      ) {
        return res.status(400).json({
          success: false,
          message: "Remark must be 2000 characters or less",
        });
      }

      const biodataId = new ObjectId(id);

      const biodata = await db
        .collection("biodatas")
        .findOne(
          { _id: biodataId },
          { projection: { _id: 1 } }
        );

      if (!biodata) {
        return res.status(404).json({
          success: false,
          message: "Biodata not found",
        });
      }

      const text = adminRemark.trim();

      if (!text) {
        await db
          .collection("adminRemarks")
          .deleteMany({ biodataId });

        return res.json({
          success: true,
          message: "Admin remark cleared",
          adminRemark: "",
        });
      }

      await db
        .collection("adminRemarks")
        .updateOne(
          { biodataId },
          {
            $set: {
              text,
              updatedAt: new Date(),
              updatedBy: req.admin.username,
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );

      return res.json({
        success: true,
        message: "Admin remark saved successfully",
        adminRemark: text,
      });

    } catch (error) {
      console.error("Save admin remark error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to save admin remark",
      });
    }
  }
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
