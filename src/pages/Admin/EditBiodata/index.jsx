// src/pages/Admin/EditBiodata/index.jsx


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminFetch } from "../../../utils/adminApi";
import "./EditBiodata.css";


const API_URL = import.meta.env.VITE_API_URL;

const getFileUrl = (filePath) => {
  if (!filePath) {
    return "";
  }

  if (
    filePath.startsWith("http://") ||
    filePath.startsWith("https://")
  ) {
    return filePath;
  }

  return `${API_URL}${filePath}`;
};

function EditBiodata() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    diet: "",
    income: "",
    gender: "",
    heightFeet: "",
    heightInches: "",
    showWhatsapp: true,
    showViewPdf: true,
    showDownloadPdf: true,
    contactNumber: "",
    maritalStatus: "",
    manglikStatus: "",
    caste: "",
    subCaste: "",
    city: "",
    state: "",
    education: "",
    occupation: "",
  });

  const [currentPhoto, setCurrentPhoto] = useState("");
  const [currentPdf, setCurrentPdf] = useState("");

  const [photo, setPhoto] = useState(null);
  const [pdf, setPdf] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");



  // ======================================================
  // PRIVATE ADMIN REMARK STATE
  // ======================================================

  const [adminRemark, setAdminRemark] = useState("");
  const [remarkLoading, setRemarkLoading] = useState(true);
  const [remarkSaving, setRemarkSaving] = useState(false);
  const [remarkError, setRemarkError] = useState("");
  const [remarkSuccess, setRemarkSuccess] = useState("");

  // ======================================================
  // FETCH EXISTING BIODATA
  // ======================================================

  useEffect(() => {
    const fetchBiodata = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/biodatas/${id}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load biodata."
          );
        }

        const biodata = result.biodata;

        const savedHeight = String(
          biodata.height || ""
        );

        const heightMatch = savedHeight.match(
          /^([3-8]) ft (1[01]|[0-9]) in$/
        );

        const heightFeet = heightMatch
          ? heightMatch[1]
          : "";

        const heightInches = heightMatch
          ? heightMatch[2]
          : "";


        setFormData({
          name: biodata.name || "",
          age: biodata.age || "",
          diet: biodata.diet || "",
          income: biodata.income ?? "",
          gender: biodata.gender || "",
          heightFeet: heightFeet,
          heightInches: heightInches,
          showWhatsapp: biodata.showWhatsapp !== false,
          showViewPdf: biodata.showViewPdf !== false,
          showDownloadPdf: biodata.showDownloadPdf !== false,
          contactNumber: biodata.contactNumber || "",
          maritalStatus:
            biodata.maritalStatus || "",
          manglikStatus:
            biodata.manglikStatus || "",
          caste: biodata.caste || "",
          subCaste: biodata.subCaste || "",
          city: biodata.city || "",
          state: biodata.state || "",
          education: biodata.education || "",
          occupation: biodata.occupation || "",
        });

        setCurrentPhoto(
          biodata.photo || ""
        );

        setCurrentPdf(
          biodata.biodataPdf || ""
        );

      } catch (err) {
        console.error(
          "Fetch biodata error:",
          err
        );

        setError(
          err.message ||
            "Unable to load biodata."
        );

      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBiodata();
    }
  }, [id]);


  // ======================================================
  // FETCH PRIVATE ADMIN REMARK
  // ======================================================

  useEffect(() => {
    let active = true;

    const fetchAdminRemark = async () => {
      try {
        setRemarkLoading(true);
        setRemarkError("");


        const response = await adminFetch(
          `/api/biodatas/${id}/admin-remark`
        );


        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load admin remark"
          );
        }

        if (active) {
          setAdminRemark(result.adminRemark || "");
        }

      } catch (error) {
        if (active) {
          setRemarkError(error.message);
        }
      } finally {
        if (active) {
          setRemarkLoading(false);
        }
      }
    };

    if (id) {
      fetchAdminRemark();
    }

    return () => {
      active = false;
    };
  }, [id]);



  // ======================================================
  // HANDLE TEXT / SELECT INPUTS
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ======================================================
  // HANDLE PHOTO
  // ======================================================

  const handlePhotoChange = (event) => {
    const file =
      event.target.files[0];

    if (!file) {
      setPhoto(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select an image file."
      );

      event.target.value = "";
      setPhoto(null);

      return;
    }

    setPhoto(file);
  };


  // ======================================================
  // HANDLE PDF
  // ======================================================

  const handlePdfChange = (event) => {
    const file =
      event.target.files[0];

    if (!file) {
      setPdf(null);
      return;
    }

    if (
      file.type !==
      "application/pdf"
    ) {
      alert(
        "Please select a PDF file."
      );

      event.target.value = "";
      setPdf(null);

      return;
    }

    setPdf(file);
  };

  // ======================================================
  // SAVE PRIVATE ADMIN REMARK
  // ======================================================

  const saveAdminRemark = async () => {
      try {
        setRemarkSaving(true);
        setRemarkError("");
        setRemarkSuccess("");


        const response = await adminFetch(
          `/api/biodatas/${id}/admin-remark`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              adminRemark,
            }),
          }
        );


        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to save admin remark"
          );
        }

        setAdminRemark(result.adminRemark || "");
        setRemarkSuccess(result.message);

      } catch (error) {
        setRemarkError(error.message);
      } finally {
        setRemarkSaving(false);
      }
  };



  // ======================================================
  // UPDATE BIODATA
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data = new FormData();

      // Biodata information
      data.append(
        "name",
        formData.name
      );

      data.append(
        "age",
        formData.age
      );

      data.append(
        "diet",
        formData.diet
      );

      data.append(
        "income",
        formData.income
      );

      data.append(
        "contactNumber",
        formData.contactNumber
      );

      data.append(
        "gender",
        formData.gender
      );

      const height =
        formData.heightFeet !== "" &&
        formData.heightInches !== ""
          ? `${formData.heightFeet} ft ${formData.heightInches} in`
          : "";

        data.append("height", height);


      data.append(
        "maritalStatus",
        formData.maritalStatus
      );
      data.append(
        "manglikStatus",
        formData.manglikStatus
      );

      data.append("caste", formData.caste);
      data.append("subCaste", formData.subCaste);

      data.append(
        "city",
        formData.city
      );

      data.append(
        "state",
        formData.state
      );

      data.append(
        "education",
        formData.education
      );

      data.append(
        "occupation",
        formData.occupation
      );


      data.append("showWhatsapp",String(formData.showWhatsapp));

      data.append("showViewPdf",String(formData.showViewPdf));

      data.append("showDownloadPdf",String(formData.showDownloadPdf));



      // Only replace photo if
      // a new photo was selected
      if (photo) {
        data.append(
          "photo",
          photo
        );
      }


      // Only replace PDF if
      // a new PDF was selected
      if (pdf) {
        data.append(
          "biodataPdf",
          pdf
        );
      }



      const response = await adminFetch(
        `/api/biodatas/${id}`,
        {
          method: "PUT",
          body: data,
        }
      );


      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update biodata."
        );
      }

      alert(
        "Biodata updated successfully."
      );

      navigate(
        `/biodata/${id}`
      );

    } catch (err) {
      console.error(
        "Update error:",
        err
      );

      setError(
        err.message ||
          "Failed to update biodata."
      );

    } finally {
      setSaving(false);
    }
  };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="edit-biodata-page">

        <h2>
          Loading Biodata...
        </h2>

      </div>
    );
  }


  // ======================================================
  // ERROR
  // ======================================================

  if (
    error &&
    !formData.name
  ) {
    return (
      <div className="edit-biodata-page">

        <h2>
          Unable to load biodata
        </h2>

        <p>
          {error}
        </p>

      </div>
    );
  }


  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="edit-biodata-page">

      {/* Header */}

      <div className="edit-biodata-header">

        <h1>
          Edit Biodata
        </h1>

        <p>
          Jaiswal Vaivaahiki Admin Panel
        </p>

      </div>


      {/* Error */}

      {error && (
        <div className="edit-error">
          {error}
        </div>
      )}


      <form
        className="biodata-form"
        onSubmit={handleSubmit}
      >

        {/* ==================================================
            PERSONAL INFORMATION
        ================================================== */}

        <div className="form-section">

          <h2>
            Personal Information
          </h2>

          <div className="form-grid">

            {/* Full Name */}

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>


            {/* Age */}

            <div className="form-group">

              <label htmlFor="age">
                Age
              </label>

              <input
                id="age"
                name="age"
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={handleChange}
                required
              />

            </div>

            {/* Diet */}

            <div className="form-group">

              <label htmlFor="diet">
                Diet
              </label>

              <select
                id="diet"
                name="diet"
                value={formData.diet}
                onChange={handleChange}
              >

                <option value="">
                  Select Diet
                </option>

                <option value="Vegetarian">
                  Vegetarian
                </option>

                <option value="Non-Vegetarian">
                  Non-Vegetarian
                </option>

                <option value="Not Specified">
                  Not Specified
                </option>

              </select>

            </div>

            {/* Annual Income */}

            <div className="form-group">

              <label htmlFor="income">
                Annual Income (₹ Lakh)
              </label>

              <input
                id="income"
                name="income"
                type="number"
                min="0"
                max="1000"
                step="0.1"
                placeholder="e.g. 10"
                value={formData.income}
                onChange={handleChange}
              />

            </div>

            {/* Parent / Guardian Contact Number */}

            <div className="form-group">

              <label htmlFor="contactNumber">
                Parent / Guardian Contact Number
              </label>

              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                placeholder="Enter 10-digit WhatsApp number"
                value={formData.contactNumber}
                onChange={handleChange}
                maxLength="10"
                pattern="[0-9]{10}"
                inputMode="numeric"
              />

            </div>


            {/* Gender */}

            <div className="form-group">

              <label htmlFor="gender">
                Gender
              </label>

              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

              </select>

            </div>


            {/* ==================================================
                HEIGHT - FEET AND INCHES
            ================================================== */}

            <div className="form-group">

              <label htmlFor="heightFeet">
                Height (Feet & Inches)
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                }}
              >

                {/* FEET */}

                <select
                  id="heightFeet"
                  name="heightFeet"
                  value={formData.heightFeet}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Feet
                  </option>

                  {Array.from(
                    { length: 6 },
                    (_, index) => index + 3
                  ).map((feet) => (
                    <option key={feet} value={feet}>
                      {feet} ft
                    </option>
                  ))}

                </select>

                {/* INCHES */}

                <select
                  id="heightInches"
                  name="heightInches"
                  value={formData.heightInches}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Inches
                  </option>

                  {Array.from(
                    { length: 12 },
                    (_, index) => index
                  ).map((inches) => (
                    <option key={inches} value={inches}>
                      {inches} in
                    </option>
                  ))}

                </select>

              </div>

            </div>



            {/* Marital Status */}

            <div className="form-group">

              <label htmlFor="maritalStatus">
                Marital Status
              </label>

              <select
                id="maritalStatus"
                name="maritalStatus"
                value={
                  formData.maritalStatus
                }
                onChange={handleChange}
                required
              >

                <option value="">
                  Select marital status
                </option>

                <option value="Unmarried">
                  Unmarried
                </option>

                <option value="Divorced">
                  Divorced
                </option>

                <option value="Widowed">
                  Widowed
                </option>

                <option value="Not Specified">
                  Not Specified
                </option>

              </select>

            </div>

            {/* Manglik Status */}

            <div className="form-group">

              <label htmlFor="manglikStatus">
                Manglik Status
              </label>

              <select
                id="manglikStatus"
                name="manglikStatus"
                value={formData.manglikStatus}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Manglik Status
                </option>

                <option value="Yes">
                  Yes
                </option>

                <option value="No">
                  No
                </option>

                <option value="Aanshik">
                  Aanshik
                </option>

                <option value="Not Specified">
                  Not Specified
                </option>

              </select>

            </div>

            {/* Caste */}

            <div className="form-group">

              <label htmlFor="caste">
                Caste
              </label>

              <select
                id="caste"
                name="caste"
                value={formData.caste}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select caste
                </option>

                <option value="Kalar">
                  Kalar
                </option>

                <option value="Kalwar">
                  Kalwar
                </option>

                <option value="Kalal">
                  Kalal
                </option>

              </select>

            </div>


            {/* Sub-caste */}

            <div className="form-group">

              <label htmlFor="subCaste">
                Sub-caste
              </label>

              <input
                id="subCaste"
                name="subCaste"
                type="text"
                placeholder="Enter sub-caste"
                value={formData.subCaste}
                onChange={handleChange}
              />

            </div>


            {/* City */}

            <div className="form-group">

              <label htmlFor="city">
                City
              </label>

              <input
                id="city"
                name="city"
                type="text"
                placeholder="e.g. Patna"
                value={formData.city}
                onChange={handleChange}
                required
              />

            </div>


            {/* State */}

            <div className="form-group">

              <label htmlFor="state">
                State
              </label>

              <input
                id="state"
                name="state"
                type="text"
                placeholder="e.g. Bihar"
                value={formData.state}
                onChange={handleChange}
                required
              />

            </div>


            {/* Education */}

            <div className="form-group">

              <label htmlFor="education">
                Education
              </label>

              <input
                id="education"
                name="education"
                type="text"
                value={formData.education}
                onChange={handleChange}
                required
              />

            </div>


            {/* Occupation */}

            <div className="form-group">

              <label htmlFor="occupation">
                Occupation
              </label>

              <input
                id="occupation"
                name="occupation"
                type="text"
                value={formData.occupation}
                onChange={handleChange}
                required
              />

            </div>


            {/* ==================================================
                PER-PROFILE BUTTON VISIBILITY
            ================================================== */}

            <div className="form-group">
              <label htmlFor="showWhatsapp">
                Contact on WhatsApp
              </label>

              <select
                id="showWhatsapp"
                name="showWhatsapp"
                value={String(formData.showWhatsapp)}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    showWhatsapp: event.target.value === "true",
                  }))
                }
              >
                <option value="true">Show Button</option>
                <option value="false">Hide Button</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="showViewPdf">
                View Biodata PDF
              </label>

              <select
                id="showViewPdf"
                name="showViewPdf"
                value={String(formData.showViewPdf)}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    showViewPdf: event.target.value === "true",
                  }))
                }
              >
                <option value="true">Show Button</option>
                <option value="false">Hide Button</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="showDownloadPdf">
                Download Biodata PDF
              </label>

              <select
                id="showDownloadPdf"
                name="showDownloadPdf"
                value={String(formData.showDownloadPdf)}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    showDownloadPdf: event.target.value === "true",
                  }))
                }
              >
                <option value="true">Show Button</option>
                <option value="false">Hide Button</option>
              </select>
            </div>


          </div>

        </div>


        {/* ==================================================
            PROFILE PHOTO
        ================================================== */}

        <div className="form-section">

          <h2>
            Profile Photo
          </h2>


          {currentPhoto && (
            <div className="current-file">

              <p>
                Current Photo
              </p>

              <img
                src={getFileUrl(currentPhoto)}
                alt={formData.name}
                className="current-photo"
              />

            </div>
          )}


          <p className="form-help">
            Leave this empty to keep the
            current photo.
          </p>


          <div className="file-upload">

            <label htmlFor="photo">
              Replace Profile Photo
            </label>

            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={
                handlePhotoChange
              }
            />


            {photo && (
              <div className="selected-file">
                New photo: {photo.name}
              </div>
            )}

          </div>

        </div>


        {/* ==================================================
            BIODATA PDF
        ================================================== */}

        <div className="form-section">

          <h2>
            Biodata PDF
          </h2>


          {currentPdf && (
            <div className="current-file">

              <p>
                Current Biodata PDF
              </p>

              <a
                href={getFileUrl(currentPdf)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Current PDF
              </a>

            </div>
          )}


          <p className="form-help">
            Leave this empty to keep the
            current PDF.
          </p>


          <div className="file-upload">

            <label htmlFor="pdf">
              Replace Biodata PDF
            </label>

            <input
              id="pdf"
              type="file"
              accept="application/pdf,.pdf"
              onChange={
                handlePdfChange
              }
            />


            {pdf && (
              <div className="selected-file">
                New PDF: {pdf.name}
              </div>
            )}

          </div>

        </div>


        {/* ==================================================
            BUTTONS
        ================================================== */}

        <div className="form-submit">

          <button
            type="submit"
            className="upload-biodata-btn"
            disabled={saving}
          >

            {saving
              ? "Saving Changes..."
              : "Save Changes"}

          </button>


          <button
            type="button"
            className="cancel-btn"
            onClick={() =>
              navigate(
                "/admin/biodata/manage"
              )
            }
          >
            Cancel
          </button>

        </div>

      </form>

      {/* ==================================================
            PRIVATE ADMIN REMARK
      ================================================== */}

      <div className="form-section admin-remark-section">

        <h2>
            🔒 Private Admin Remark
        </h2>

        <p className="form-help">
            This note is visible only to administrators.
            It will not appear on the public biodata profile.
        </p>

        <div className="form-group">

          <label htmlFor="adminRemark">
              Admin Notes
          </label>

          <textarea
            id="adminRemark"
            name="adminRemark"
            rows={5}
            maxLength={2000}
            placeholder="Write a private note for this biodata..."
            value={adminRemark}
            onChange={(event) => {
                setAdminRemark(event.target.value);
                setRemarkSuccess("");
            }}
              disabled={remarkLoading || remarkSaving}
            style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxSizing: "border-box",
                font: "inherit",
                resize: "vertical",
            }}
        />

          <small>
              {adminRemark.length}/2000 characters
          </small>

        </div>

        {remarkLoading && (
            <p>Loading private remark...</p>
        )}

        {remarkError && (
            <p style={{ color: "#b00020" }}>
              {remarkError}
            </p>
        )}

        {remarkSuccess && (
            <p style={{ color: "#006b3c" }}>
              {remarkSuccess}
            </p>
        )}

        <button
          type="button"
          className="upload-biodata-btn"
          onClick={saveAdminRemark}
          disabled={remarkLoading || remarkSaving}
        >
          {remarkSaving
              ? "Saving Remark..."
              : "Save Admin Remark"}
        </button>

      </div>


    </div>
  );
}

export default EditBiodata;