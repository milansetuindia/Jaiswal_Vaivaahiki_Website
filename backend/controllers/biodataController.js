// backend/controllers/biodataController.js

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");

const cloudinary = require("../config/cloudinary");

const {
  createBiodataDocument,
} = require("../models/Biodata");

// ======================================================
// CLOUDINARY UPLOAD HELPER
// ======================================================

function uploadBufferToCloudinary(
  buffer,
  options
) {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

    uploadStream.end(buffer);
  });
}

// ======================================================
// DELETE CLOUDINARY FILE
// ======================================================

async function deleteCloudinaryFile(
  publicId,
  resourceType
) {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type:
          resourceType || "image",
      }
    );

    console.log(
      `Cloudinary ${resourceType || "image"} deleted:`,
      publicId
    );
  } catch (error) {
    console.error(
      `Cloudinary ${resourceType || "image"} deletion error:`,
      error.message
    );
  }
}

// ======================================================
// DELETE OLD LOCAL FILE
// ======================================================
//
// This is kept temporarily so that any old biodata
// uploaded before Cloudinary migration can still be
// deleted correctly.
// ======================================================

async function deleteLegacyLocalFile(
  fileUrl,
  label
) {
  if (!fileUrl) {
    return;
  }

  // Only handle old local /uploads/... files.
  if (!fileUrl.startsWith("/uploads/")) {
    return;
  }

  const filename =
    path.basename(fileUrl);

  const filePath = path.join(
    __dirname,
    "../uploads",
    filename
  );

  try {
    await fs.promises.unlink(
      filePath
    );

    console.log(
      `Legacy ${label} deleted:`,
      filename
    );

  } catch (error) {

    if (error.code !== "ENOENT") {
      console.error(
        `Legacy ${label} deletion error:`,
        error.message
      );
    }
  }
}

// ======================================================
// UPLOAD BIODATA
// ======================================================

async function uploadBiodata(
  req,
  res
) {
  try {

    const db =
      req.app.locals.db;

    if (!db) {
      return res.status(500).json({
        success: false,
        message:
          "Database is not connected",
      });
    }

    const {
      name,
      age,
      gender,
      city,
      state,
      education,
      occupation,
      maritalStatus,
      caste,
      subCaste,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!name || !age) {
      return res.status(400).json({
        success: false,
        message:
          "Name and age are required",
      });
    }

    if (
      !req.files ||
      !req.files.photo ||
      !req.files.biodataPdf
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Exactly one photo and one biodata PDF are required",
      });
    }

    const photo =
      req.files.photo[0];

    const biodataPdf =
      req.files.biodataPdf[0];

    // ==================================================
    // UNIQUE CLOUDINARY IDS
    // ==================================================

    const uniqueId =
      `${Date.now()}-${crypto.randomUUID()}`;

    // ==================================================
    // UPLOAD PHOTO TO CLOUDINARY
    // ==================================================

    const uploadedPhoto =
      await uploadBufferToCloudinary(
        photo.buffer,
        {
          folder:
            "jaiswal_vaivaahiki/photos",

          public_id:
            uniqueId,

          resource_type:
            "image",
        }
      );

    // ==================================================
    // UPLOAD PDF TO CLOUDINARY
    // ==================================================

    let uploadedPdf;

    try {

      uploadedPdf =
        await uploadBufferToCloudinary(
          biodataPdf.buffer,
          {
            folder:
              "jaiswal_vaivaahiki/pdfs",

            public_id:
              `${uniqueId}.pdf`,

            resource_type:
              "raw",
          }
        );

    } catch (pdfError) {

      // If PDF upload fails, remove
      // the photo that was already uploaded.

      await deleteCloudinaryFile(
        uploadedPhoto.public_id,
        "image"
      );

      throw pdfError;
    }

    // ==================================================
    // CREATE MONGODB DOCUMENT
    // ==================================================

    const document =
      createBiodataDocument({
        name,
        age,
        gender,
        city,
        state,
        education,
        occupation,
        maritalStatus,
        caste,
        subCaste,

        // Cloudinary URLs
        photo:
          uploadedPhoto.secure_url,

        biodataPdf:
          uploadedPdf.secure_url,
      });

    // ==================================================
    // SAVE CLOUDINARY PUBLIC IDS
    // ==================================================

    document.photoPublicId =
      uploadedPhoto.public_id;

    document.biodataPdfPublicId =
      uploadedPdf.public_id;

    document.createdAt =
      new Date();

    // ==================================================
    // INSERT INTO MONGODB
    // ==================================================

    try {

      const result =
        await db
          .collection("biodatas")
          .insertOne(document);

      return res.status(201).json({
        success: true,
        message:
          "Biodata uploaded successfully",
        id: result.insertedId,
        biodata: document,
      });

    } catch (databaseError) {

      // If MongoDB insertion fails,
      // remove both Cloudinary files.

      await deleteCloudinaryFile(
        uploadedPhoto.public_id,
        "image"
      );

      await deleteCloudinaryFile(
        uploadedPdf.public_id,
        "raw"
      );

      throw databaseError;
    }

  } catch (error) {

    console.error(
      "Upload biodata error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload biodata",
    });
  }
}

// ======================================================
// GET ALL BIODATAS
// ======================================================

async function getAllBiodatas(
  req,
  res
) {
  try {

    const db =
      req.app.locals.db;

    const biodatas =
      await db
        .collection("biodatas")
        .find({})
        .sort({
          createdAt: -1,
        })
        .toArray();

    res.json({
      success: true,
      count: biodatas.length,
      biodatas,
    });

  } catch (error) {

    console.error(
      "Get biodatas error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch biodatas",
    });
  }
}

// ======================================================
// GET BIODATA BY ID
// ======================================================

async function getBiodataById(
  req,
  res
) {
  try {

    const db =
      req.app.locals.db;

    if (
      !ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid biodata ID",
      });
    }

    const biodata =
      await db
        .collection("biodatas")
        .findOne({
          _id: new ObjectId(
            req.params.id
          ),
        });

    if (!biodata) {
      return res.status(404).json({
        success: false,
        message:
          "Biodata not found",
      });
    }

    res.json({
      success: true,
      biodata,
    });

  } catch (error) {

    console.error(
      "Get biodata error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch biodata",
    });
  }
}



// ======================================================
// UPDATE / EDIT BIODATA
// ======================================================

async function updateBiodata(
  req,
  res
) {
  try {
    const db = req.app.locals.db;

    if (!db) {
      return res.status(500).json({
        success: false,
        message: "Database is not connected",
      });
    }

    const { id } = req.params;

    // ==================================================
    // VALIDATE ID
    // ==================================================

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid biodata ID",
      });
    }

    const objectId = new ObjectId(id);

    // ==================================================
    // FIND EXISTING BIODATA
    // ==================================================

    const existingBiodata =
      await db
        .collection("biodatas")
        .findOne({
          _id: objectId,
        });

    if (!existingBiodata) {
      return res.status(404).json({
        success: false,
        message: "Biodata not found",
      });
    }

    // ==================================================
    // GET FORM DATA
    // ==================================================

    const {
      name,
      age,
      gender,
      city,
      state,
      education,
      occupation,
      maritalStatus,
      caste,
      subCaste,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!name || !age) {
      return res.status(400).json({
        success: false,
        message: "Name and age are required",
      });
    }

    // ==================================================
    // BASIC DATA
    // ==================================================

    const updateData = {
      name,
      age: Number(age),
      gender: gender || "",
      city: city || "",
      state: state || "",
      education: education || "",
      occupation: occupation || "",
      maritalStatus: maritalStatus || "",
      caste: caste || "",
      subCaste: subCaste || "",
      updatedAt: new Date(),
    };

    // ==================================================
    // TRACK NEW CLOUDINARY FILES
    // ==================================================
    //
    // If MongoDB update fails, these newly uploaded
    // files will be deleted.
    //
    // ==================================================

    let newPhoto = null;
    let newPdf = null;

    // ==================================================
    // UPLOAD NEW PHOTO
    // ==================================================

    if (
      req.files &&
      req.files.photo &&
      req.files.photo.length > 0
    ) {
      const photo =
        req.files.photo[0];

      const uniquePhotoId =
        `${Date.now()}-${crypto.randomUUID()}`;

      try {
        newPhoto =
          await uploadBufferToCloudinary(
            photo.buffer,
            {
              folder:
                "jaiswal_vaivaahiki/photos",

              public_id:
                uniquePhotoId,

              resource_type:
                "image",
            }
          );

        updateData.photo =
          newPhoto.secure_url;

        updateData.photoPublicId =
          newPhoto.public_id;

      } catch (photoError) {
        console.error(
          "New photo upload failed:",
          photoError
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to upload new photo",
        });
      }
    }

    // ==================================================
    // UPLOAD NEW PDF
    // ==================================================

    if (
      req.files &&
      req.files.biodataPdf &&
      req.files.biodataPdf.length > 0
    ) {
      const pdf =
        req.files.biodataPdf[0];

      const uniquePdfId =
        `${Date.now()}-${crypto.randomUUID()}`;

      try {
        newPdf =
          await uploadBufferToCloudinary(
            pdf.buffer,
            {
              folder:
                "jaiswal_vaivaahiki/pdfs",

              public_id:
                `${uniquePdfId}.pdf`,

              resource_type:
                "raw",
            }
          );

        updateData.biodataPdf =
          newPdf.secure_url;

        updateData.biodataPdfPublicId =
          newPdf.public_id;

      } catch (pdfError) {
        console.error(
          "New PDF upload failed:",
          pdfError
        );

        // ==============================================
        // PDF FAILED
        // Delete newly uploaded photo if one exists.
        // Old files remain untouched.
        // ==============================================

        if (newPhoto) {
          await deleteCloudinaryFile(
            newPhoto.public_id,
            "image"
          );
        }

        return res.status(500).json({
          success: false,
          message:
            "Failed to upload new biodata PDF",
        });
      }
    }

    // ==================================================
    // UPDATE MONGODB FIRST
    // ==================================================
    //
    // IMPORTANT:
    // Old Cloudinary files are NOT deleted yet.
    //
    // ==================================================

    try {
      const updateResult =
        await db
          .collection("biodatas")
          .updateOne(
            {
              _id: objectId,
            },
            {
              $set: updateData,
            }
          );

      if (
        updateResult.matchedCount === 0
      ) {
        throw new Error(
          "Biodata could not be updated in database"
        );
      }

    } catch (databaseError) {

      console.error(
        "MongoDB update failed:",
        databaseError
      );

      // ==============================================
      // DATABASE UPDATE FAILED
      //
      // Delete ONLY the newly uploaded files.
      //
      // Old files are still safe.
      // ==============================================

      if (newPhoto) {
        await deleteCloudinaryFile(
          newPhoto.public_id,
          "image"
        );
      }

      if (newPdf) {
        await deleteCloudinaryFile(
          newPdf.public_id,
          "raw"
        );
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update biodata",
      });
    }

    // ==================================================
    // MONGODB UPDATE SUCCEEDED
    // ==================================================
    //
    // NOW it is safe to remove the old files.
    //
    // ==================================================

    // ==================================================
    // DELETE OLD PHOTO
    // ==================================================

    if (newPhoto) {

      if (
        existingBiodata.photoPublicId
      ) {
        await deleteCloudinaryFile(
          existingBiodata.photoPublicId,
          "image"
        );
      } else {
        await deleteLegacyLocalFile(
          existingBiodata.photo,
          "photo"
        );
      }
    }

    // ==================================================
    // DELETE OLD PDF
    // ==================================================

    if (newPdf) {

      if (
        existingBiodata.biodataPdfPublicId
      ) {
        await deleteCloudinaryFile(
          existingBiodata.biodataPdfPublicId,
          "raw"
        );
      } else {
        await deleteLegacyLocalFile(
          existingBiodata.biodataPdf,
          "PDF"
        );
      }
    }

    // ==================================================
    // GET UPDATED BIODATA
    // ==================================================

    const updatedBiodata =
      await db
        .collection("biodatas")
        .findOne({
          _id: objectId,
        });

    // ==================================================
    // SUCCESS
    // ==================================================

    return res.json({
      success: true,
      message:
        "Biodata updated successfully",
      biodata:
        updatedBiodata,
    });

  } catch (error) {

    console.error(
      "Update biodata error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update biodata",
    });
  }
}





// ======================================================
// DELETE BIODATA
// ======================================================

async function deleteBiodata(
  req,
  res
) {
  try {

    const db =
      req.app.locals.db;

    if (!db) {
      return res.status(500).json({
        success: false,
        message:
          "Database is not connected",
      });
    }

    const { id } =
      req.params;

    if (
      !ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid biodata ID",
      });
    }

    // ==================================================
    // FIND BIODATA
    // ==================================================

    const biodata =
      await db
        .collection("biodatas")
        .findOne({
          _id: new ObjectId(id),
        });

    if (!biodata) {
      return res.status(404).json({
        success: false,
        message:
          "Biodata not found",
      });
    }

    // ==================================================
    // DELETE PHOTO
    // ==================================================

    if (
      biodata.photoPublicId
    ) {

      await deleteCloudinaryFile(
        biodata.photoPublicId,
        "image"
      );

    } else {

      // Support old locally stored biodata
      await deleteLegacyLocalFile(
        biodata.photo,
        "photo"
      );
    }

    // ==================================================
    // DELETE PDF
    // ==================================================

    if (
      biodata.biodataPdfPublicId
    ) {

      await deleteCloudinaryFile(
        biodata.biodataPdfPublicId,
        "raw"
      );

    } else {

      // Support old locally stored biodata
      await deleteLegacyLocalFile(
        biodata.biodataPdf,
        "PDF"
      );
    }

    // ==================================================
    // DELETE MONGODB DOCUMENT
    // ==================================================

    await db
      .collection("biodatas")
      .deleteOne({
        _id: new ObjectId(id),
      });

    return res.json({
      success: true,
      message:
        "Biodata, photo and PDF deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete biodata error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete biodata",
    });
  }
}

// ======================================================
// AUTOMATIC 6-MONTH BIODATA CLEANUP
// ======================================================

async function cleanupExpiredBiodatas(
  db
) {
  try {

    if (!db) {
      console.error(
        "Automatic cleanup skipped: Database is not connected"
      );

      return;
    }

    // ==================================================
    // CALCULATE EXPIRY DATE
    // ==================================================

    const expiryDate =
      new Date();

    expiryDate.setMonth(
      expiryDate.getMonth() - 6
    );

    // ==================================================
    // FIND EXPIRED BIODATA
    // ==================================================

    const expiredBiodatas =
      await db
        .collection("biodatas")
        .find({
          createdAt: {
            $exists: true,
            $lt: expiryDate,
          },
        })
        .toArray();

    if (
      expiredBiodatas.length === 0
    ) {

      console.log(
        "Automatic cleanup: No expired biodata found."
      );

      return;
    }

    console.log(
      `Automatic cleanup: Found ${expiredBiodatas.length} expired biodata profile(s).`
    );

    // ==================================================
    // DELETE EACH EXPIRED BIODATA
    // ==================================================

    for (
      const biodata
      of expiredBiodatas
    ) {

      // ================================================
      // DELETE PHOTO
      // ================================================

      if (
        biodata.photoPublicId
      ) {

        await deleteCloudinaryFile(
          biodata.photoPublicId,
          "image"
        );

      } else {

        // Support old local biodata
        await deleteLegacyLocalFile(
          biodata.photo,
          "expired photo"
        );
      }

      // ================================================
      // DELETE PDF
      // ================================================

      if (
        biodata.biodataPdfPublicId
      ) {

        await deleteCloudinaryFile(
          biodata.biodataPdfPublicId,
          "raw"
        );

      } else {

        // Support old local biodata
        await deleteLegacyLocalFile(
          biodata.biodataPdf,
          "expired PDF"
        );
      }

      // ================================================
      // DELETE MONGODB DOCUMENT
      // ================================================

      await db
        .collection("biodatas")
        .deleteOne({
          _id: biodata._id,
        });

      console.log(
        `Expired biodata deleted: ${
          biodata.name ||
          biodata._id
        }`
      );
    }

    console.log(
      "Automatic 6-month biodata cleanup completed."
    );

  } catch (error) {

    console.error(
      "Automatic biodata cleanup error:",
      error
    );
  }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  uploadBiodata,
  getAllBiodatas,
  getBiodataById,
  deleteBiodata,
  updateBiodata,
  cleanupExpiredBiodatas,
};
