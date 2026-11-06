
const crypto = require("crypto");
const { ObjectId } = require("mongodb");

const cloudinary = require("../config/cloudinary");
const {
  createBiodataDocument,
} = require("../models/Biodata");

// ======================================================
// PUBLIC VISIBILITY RULE
// Old admin-created records remain public.
// User submissions require explicit approval.
// ======================================================


const publicFilter = {
  $or: [
    // Keep existing admin-created biodatas visible.
    {
      submissionSource: {
        $ne: "user",
      },
    },

    // User submissions require explicit approval.
    {
      submissionSource: "user",
      approvalStatus: "approved",
    },
  ],
};


// ======================================================
// UPLOAD FILE TO CLOUDINARY
// ======================================================


function uploadFile(buffer, options) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const fileType =
      options.resource_type === "raw"
        ? "BIODATA PDF"
        : "PROFILE PHOTO";

    console.log(
      `Starting Cloudinary upload: ${fileType}`
    );

    console.log(
      `File size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`
    );

    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          ...options,

          // Maximum wait time: 120 seconds
          timeout: 120000,
        },

        (error, result) => {
          const elapsedSeconds = (
            (Date.now() - startTime) / 1000
          ).toFixed(2);

          if (error) {
            console.error(
              `Cloudinary ${fileType} failed after ${elapsedSeconds}s:`,
              {
                message: error.message,
                http_code: error.http_code,
              }
            );

            return reject(error);
          }

          console.log(
            `Cloudinary ${fileType} uploaded successfully in ${elapsedSeconds}s`
          );

          resolve(result);
        }
      );

    uploadStream.on("error", reject);

    uploadStream.end(buffer);
  });
}


async function removeUploadedFile(file, resourceType) {
  if (!file?.public_id) return;

  try {
    await cloudinary.uploader.destroy(
      file.public_id,
      {
        resource_type: resourceType,
        type: file.type || "upload",
      }
    );
  } catch (error) {
    console.error("Cloudinary cleanup:", error);
  }
}

// ======================================================
// SIGN SHORT-LIVED ACCESS TO A PRIVATE PDF
// ======================================================

function signedPrivatePdfUrl(doc, attachment = false) {
  if (!doc.biodataPdfPublicId) {
    return null;
  }

  return cloudinary.utils.private_download_url(
    doc.biodataPdfPublicId,
    null,
    {
      resource_type: "raw",
      type: "authenticated",
      expires_at:
        Math.floor(Date.now() / 1000) + 60,
      attachment,
    }
  );
}

// ======================================================
// SAFE PUBLIC BIODATA RESPONSE
// ======================================================



function publicBiodata(doc) {
  const showWhatsapp =
    doc.showWhatsapp !== false;

  const showViewPdf =
    doc.showViewPdf !== false;

  const showDownloadPdf =
    doc.showDownloadPdf !== false;

  const result = {
    _id: doc._id,
    profileNumber: doc.profileNumber,

    name: doc.name,
    age: doc.age,
    diet: doc.diet,
    income: doc.income,
    gender: doc.gender,
    height: doc.height,

    city: doc.city,
    state: doc.state,
    education: doc.education,
    occupation: doc.occupation,

    maritalStatus: doc.maritalStatus,
    manglikStatus: doc.manglikStatus,
    caste: doc.caste,
    subCaste: doc.subCaste,

    photo: doc.photo,
    createdAt: doc.createdAt,

    showWhatsapp,
    showViewPdf,
    showDownloadPdf,
  };

  // Only include contact number if
  // the admin enabled the WhatsApp button.
  if (showWhatsapp) {
    result.contactNumber =
      doc.contactNumber || "";
  }

  // Only expose PDF access when permitted.
  if (
    (showViewPdf || showDownloadPdf) &&
    doc.biodataPdf
  ) {
    if (doc.biodataPdfType === "authenticated") {
      result.biodataPdf =
        `/api/biodatas/${doc._id}/pdf`;
    } else {
      result.biodataPdf =
        doc.biodataPdf;
    }
  }

  return result;
}



// ======================================================
// VALIDATE USER-SUBMITTED FIELDS
// ======================================================

function validateSubmission(body, files) {
  const fields = [
    "name", "diet", "gender", "height",
    "city", "state", "education",
    "occupation", "contactNumber",
    "maritalStatus", "manglikStatus",
    "caste", "subCaste",
  ];

  for (const field of fields) {
    if (
      body[field] !== undefined &&
      typeof body[field] !== "string"
    ) {
      return `Invalid ${field}.`;
    }

    if (
      typeof body[field] === "string" &&
      body[field].length > 250
    ) {
      return `${field} is too long.`;
    }
  }

  const required = [
    "name", "gender", "city", "state",
    "education", "occupation",
    "manglikStatus", "caste",
  ];

  for (const field of required) {
    if (!body[field]?.trim()) {
      return `${field} is required.`;
    }
  }

  const age = Number(body.age);

  if (
    !Number.isInteger(age) ||
    age < 18 ||
    age > 100
  ) {
    return "Age must be between 18 and 100.";
  }

  if (
    body.income !== undefined &&
    body.income !== "" &&
    (
      !Number.isFinite(Number(body.income)) ||
      Number(body.income) < 0 ||
      Number(body.income) > 1000
    )
  ) {
    return "Invalid annual income.";
  }

  if (
    body.height &&
    !/^([3-8]) ft (1[01]|[0-9]) in$/.test(
      body.height
    )
  ) {
    return "Invalid height format.";
  }

  if (
    body.contactNumber &&
    !/^\d{10}$/.test(body.contactNumber)
  ) {
    return "Contact number must contain 10 digits.";
  }

  if (
    !files?.photo?.[0] ||
    !files?.biodataPdf?.[0]
  ) {
    return "One photo and one PDF are required.";
  }

  // Check PDF signature, not just MIME type.
  const pdfBuffer = files.biodataPdf[0].buffer;

  if (
    pdfBuffer.subarray(0, 5).toString() !==
    "%PDF-"
  ) {
    return "The biodata file is not a valid PDF.";
  }

  return null;
}

// ======================================================
// USER UPLOAD - ONE BIODATA PER ACCOUNT
// POST /api/user-biodata
// ======================================================

async function submitUserBiodata(req, res) {
  const db = req.app.locals.db;
  const biodatas = db.collection("biodatas");


  let uploadedPhoto = null;
  let uploadedPdf = null;

  // Track whether MongoDB successfully inserted the biodata.
  let biodataInserted = false;


  try {

    const error = validateSubmission(
      req.body,
      req.files
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    // ======================================================
    // VERIFY USER CONSENT
    // ======================================================

    if (req.body.consentToSubmission !== "true") {
      return res.status(400).json({
        success: false,
        message:
          "You must agree to the biodata submission consent before uploading.",
      });
    }



    // ======================================================
    // CHECK ACCOUNT'S PREVIOUS BIODATA SUBMISSION
    // ======================================================

    const userAccount = await db
      .collection("users")
      .findOne({
        _id: req.userId,
      });

    if (!userAccount) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (userAccount.hasSubmittedBiodata === true) {
      return res.status(409).json({
        success: false,
        message:
          "This account has already submitted a biodata. Please contact admin for corrections or removal.",
      });
    }



    // Early duplicate check for a friendly message.
    // The unique MongoDB index is the final
    // protection against simultaneous submissions.
    const existing = await biodatas.findOne({
      submittedByUserId: req.userId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "You have already submitted your biodata.",
      });
    }

    const uniqueId =
      `${Date.now()}-${crypto.randomUUID()}`;

    uploadedPhoto = await uploadFile(
      req.files.photo[0].buffer,
      {
        folder: "jaiswal_vaivaahiki/photos",
        public_id: uniqueId,
        resource_type: "image",
      }
    );

    // Authenticated storage protects user PDF
    // before and after admin review.
    uploadedPdf = await uploadFile(
      req.files.biodataPdf[0].buffer,
      {
        folder:
          "jaiswal_vaivaahiki/private_pdfs",
        public_id: `${uniqueId}.pdf`,
        resource_type: "raw",
        type: "authenticated",
      }
    );

    // Reserve the next profile number using
    // the existing MongoDB counter.
    const counter = await db
      .collection("counters")
      .findOneAndUpdate(
        { _id: "biodataProfileNumber" },
        { $inc: { sequence: 1 } },
        { returnDocument: "after" }
      );

    if (!counter) {
      throw new Error(
        "Profile number counter is not initialized."
      );
    }

    const profileNumber =
      `JV-${String(counter.sequence).padStart(3, "0")}`;

    const document = createBiodataDocument({
      profileNumber,
      name: req.body.name.trim(),
      age: req.body.age,
      diet: req.body.diet,
      income: req.body.income,
      gender: req.body.gender,
      height: req.body.height,

      city: req.body.city,
      state: req.body.state,
      education: req.body.education,
      occupation: req.body.occupation,
      contactNumber: req.body.contactNumber,
      maritalStatus: req.body.maritalStatus,
      manglikStatus: req.body.manglikStatus,
      caste: req.body.caste,
      subCaste: req.body.subCaste,

      // These values cannot be selected by
      // a user through the frontend.
      showWhatsapp: false,
      showViewPdf: false,
      showDownloadPdf: false,

      photo: uploadedPhoto.secure_url,
      biodataPdf: uploadedPdf.secure_url,
    });


    Object.assign(document, {
      // ======================================================
      // USER SUBMISSION DETAILS
      // ======================================================

      submittedByUserId: req.userId,
      submissionSource: "user",
      approvalStatus: "pending",

      // ======================================================
      // EXISTING ADMIN-CONTROLLED BUTTON VISIBILITY
      // ======================================================

      showWhatsapp: false,
      showViewPdf: false,
      showDownloadPdf: false,

      // ======================================================
      // CLOUDINARY FILE DETAILS
      // ======================================================

      photoPublicId: uploadedPhoto.public_id,
      biodataPdfPublicId: uploadedPdf.public_id,
      biodataPdfType: "authenticated",

      // ======================================================
      // USER CONSENT RECORD
      // ======================================================

      consentToSubmission: true,
      consentAcceptedAt: new Date(),

      // ======================================================
      // TIMESTAMPS
      // ======================================================

      submittedAt: new Date(),
      updatedAt: new Date(),
    });



    // ======================================================
    // SAVE BIODATA TO MONGODB
    // ======================================================

    const insertResult = await biodatas.insertOne(
      document
    );

    biodataInserted = true;

    console.log(
      "USER BIODATA INSERTED:",
      {
        biodataId: insertResult.insertedId.toString(),
        profileNumber,
        userId: req.userId.toString(),
        approvalStatus: "pending",
      }
    );

    // ======================================================
    // RECORD SUBMISSION HISTORY ON USER ACCOUNT
    // ======================================================

    try {
      const userUpdateResult = await db
        .collection("users")
        .updateOne(
          {
            _id: req.userId,
          },
          {
            $set: {
              hasSubmittedBiodata: true,
              biodataSubmittedAt: new Date(),
            },
          }
        );

      if (userUpdateResult.matchedCount !== 1) {
        console.error(
          "USER SUBMISSION FLAG NOT UPDATED:",
          {
            biodataId:
              insertResult.insertedId.toString(),
          }
        );
      }

    } catch (accountError) {
      // The biodata has already been saved.
      // Never delete its files because of an
      // account-history update failure.

      console.error(
        "USER SUBMISSION ACCOUNT UPDATE FAILED:",
        accountError
      );
    }

    // ======================================================
    // SUCCESS RESPONSE
    // ======================================================

    return res.status(201).json({
      success: true,

      message:
        "Biodata submitted successfully. It is pending admin approval.",

      id: insertResult.insertedId.toString(),
      profileNumber,
      approvalStatus: "pending",
    });



  } catch (error) {

    console.error(
      "User biodata submission failed:",
      error
    );

    // Delete newly uploaded files only if the
    // biodata was NOT successfully inserted.
    //
    // If insertion succeeded, the database record
    // must not be left pointing to deleted files.

    if (!biodataInserted) {
      await removeUploadedFile(
        uploadedPhoto,
        "image"
      );

      await removeUploadedFile(
        uploadedPdf,
        "raw"
      );
    }


    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Only one biodata is allowed per user account.",
      });
    }

    console.error(
      "User biodata submission error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to submit biodata.",
    });
  }
}

// ======================================================
// GET OWN SUBMISSION STATUS
// GET /api/user-biodata/me
// ======================================================


async function getMyBiodata(req, res) {
  try {
    const db = req.app.locals.db;

    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable.",
      });
    }

    const biodata = await db
      .collection("biodatas")
      .findOne(
        {
          submittedByUserId: req.userId,
        },
        {
          projection: {
            _id: 1,
            profileNumber: 1,
            name: 1,
            approvalStatus: 1,
            submittedAt: 1,
            createdAt: 1,
          },
        }
      );

    return res.json({
      success: true,
      biodata: biodata || null,
    });

  } catch (error) {
    console.error(
      "Get my biodata error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load your biodata.",
    });
  }
}


// ======================================================
// PUBLIC LIST - PENDING/REJECTED HIDDEN
// ======================================================

async function getPublicBiodatas(req, res) {
  try {
    const docs = await req.app.locals.db
      .collection("biodatas")
      .find(publicFilter)
      .sort({ createdAt: -1 })
      .toArray();

    const biodatas = docs.map(publicBiodata);

    return res.json({
      success: true,
      count: biodatas.length,
      biodatas,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to load biodatas.",
    });
  }
}

// ======================================================
// PUBLIC DETAIL
// ======================================================

async function getPublicBiodataById(req, res) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid biodata ID.",
      });
    }

    const doc = await req.app.locals.db
      .collection("biodatas")
      .findOne({
        _id: new ObjectId(req.params.id),
        ...publicFilter,
      });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Biodata not found.",
      });
    }

    return res.json({
      success: true,
      biodata: publicBiodata(doc),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to load biodata.",
    });
  }
}

// ======================================================
// ADMIN LIST - INCLUDES PENDING SUBMISSIONS
// ======================================================

async function getAdminBiodatas(req, res) {
  try {
    const docs = await req.app.locals.db
      .collection("biodatas")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Admin receives full information.
    return res.json({
      success: true,
      count: docs.length,
      biodatas: docs,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin biodatas.",
    });
  }
}

// ======================================================
// ADMIN DETAIL
// ======================================================

async function getAdminBiodataById(req, res) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid biodata ID.",
      });
    }

    const doc = await req.app.locals.db
      .collection("biodatas")
      .findOne({
        _id: new ObjectId(req.params.id),
      });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Biodata not found.",
      });
    }

    // Signed short-lived URL for authenticated
    // user-uploaded PDF, available only to admin.
    if (
      doc.biodataPdfType === "authenticated"
    ) {
      doc.biodataPdf =
        signedPrivatePdfUrl(doc);
    }

    return res.json({
      success: true,
      biodata: doc,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to load biodata.",
    });
  }
}

// ======================================================
// ADMIN APPROVE / REJECT
// ======================================================

async function setApprovalStatus(req, res) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid biodata ID.",
      });
    }

    const { status } = req.body || {};

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid approval status.",
      });
    }

    const result = await req.app.locals.db
      .collection("biodatas")
      .findOneAndUpdate(
        {
          _id: new ObjectId(req.params.id),
          submissionSource: "user",
        },
        {
          $set: {
            approvalStatus: status,
            reviewedAt: new Date(),
            reviewedBy: req.admin.username,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:
          "User submission not found.",
      });
    }

    return res.json({
      success: true,
      message: `Biodata ${status}.`,
      approvalStatus: status,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to update approval.",
    });
  }
}

// ======================================================
// PUBLIC RESTRICTED PDF ACCESS
// ======================================================

async function getPublicPdf(req, res) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.sendStatus(400);
    }

    const doc = await req.app.locals.db
      .collection("biodatas")
      .findOne({
        _id: new ObjectId(req.params.id),
        ...publicFilter,
      });

    if (!doc || !doc.biodataPdf) {
      return res.sendStatus(404);
    }

    // A PDF request must be explicitly enabled
    // by the administrator.
    if (
      doc.showViewPdf !== true &&
      doc.showDownloadPdf !== true
    ) {
      return res.sendStatus(403);
    }

    if (
      doc.biodataPdfType === "authenticated"
    ) {
      const url = signedPrivatePdfUrl(
        doc,
        false
      );

      return res.redirect(302, url);
    }

    // Existing publicly hosted admin PDF.
    return res.redirect(302, doc.biodataPdf);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

module.exports = {
  submitUserBiodata,
  getMyBiodata,
  getPublicBiodatas,
  getPublicBiodataById,
  getAdminBiodatas,
  getAdminBiodataById,
  setApprovalStatus,
  getPublicPdf,
};
