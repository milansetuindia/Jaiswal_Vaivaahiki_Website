// src/pages/Admin/AddBiodata/index.jsx

import { useState } from "react";
import "./AddBiodata.css";

const API_URL = import.meta.env.VITE_API_URL;

function AddBiodata() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    maritalStatus: "",
    caste: "",
    subCaste: "",
    city: "",
    state: "",
    education: "",
    occupation: "",
  });

  const [photo, setPhoto] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setPhoto(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      setPhoto(null);
      return;
    }

    setPhoto(file);
  };

  const handlePdfChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setPdf(null);
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      event.target.value = "";
      setPdf(null);
      return;
    }

    setPdf(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!photo) {
      alert("Please upload one profile photo.");
      return;
    }

    if (!pdf) {
      alert("Please upload one biodata PDF.");
      return;
    }

    try {
      setUploading(true);

      const data = new FormData();

      // ==========================================
      // BIODATA INFORMATION
      // ==========================================

      data.append("name", formData.name);
      data.append("age", formData.age);
      data.append("gender", formData.gender);
      data.append("maritalStatus", formData.maritalStatus);
      data.append("caste", formData.caste);
      data.append("subCaste", formData.subCaste);
      data.append("city", formData.city);
      data.append("state", formData.state);
      data.append("education", formData.education);
      data.append("occupation", formData.occupation);

      // ==========================================
      // FILES
      // ==========================================

      data.append("photo", photo);
      data.append("biodataPdf", pdf);

      const response = await fetch(
        `${API_URL}/api/biodatas/upload`,
        {
          method: "POST",

          headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },

          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to upload biodata."
        );
      }

      alert(
        "Biodata uploaded successfully!"
      );

      // ==========================================
      // CLEAR FORM
      // ==========================================

      setFormData({
        name: "",
        age: "",
        gender: "",
        maritalStatus: "",
        caste: "",
        subCaste: "",
        city: "",
        state: "",
        education: "",
        occupation: "",
      });

      setPhoto(null);
      setPdf(null);

      const photoInput =
        document.getElementById("photo");

      const pdfInput =
        document.getElementById("pdf");

      if (photoInput) {
        photoInput.value = "";
      }

      if (pdfInput) {
        pdfInput.value = "";
      }

    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while uploading biodata."
      );

    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="add-biodata-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="add-biodata-header">

        <h1>
          Add Biodata
        </h1>

        <p>
          Jaiswal Vaivaahiki Admin Panel
        </p>

      </div>


      <form
        className="biodata-form"
        onSubmit={handleSubmit}
      >

        {/* ========================================
            PERSONAL INFORMATION
        ======================================== */}

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
                placeholder="Enter full name"
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
                placeholder="Enter age"
                value={formData.age}
                onChange={handleChange}
                required
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


            {/* Marital Status */}

            <div className="form-group">

              <label htmlFor="maritalStatus">
                Marital Status
              </label>

              <select
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select marital status
                </option>

                <option value="Never Married">
                  Never Married
                </option>

                <option value="Divorced">
                  Divorced
                </option>

                <option value="Widowed">
                  Widowed
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
                placeholder="e.g. M.Tech"
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
                placeholder="e.g. Software Engineer"
                value={formData.occupation}
                onChange={handleChange}
                required
              />

            </div>

          </div>

        </div>


        {/* ========================================
            PROFILE PHOTO
        ======================================== */}

        <div className="form-section">

          <h2>
            Profile Photo
          </h2>

          <p className="form-help">
            Upload exactly one photo for this person.
          </p>

          <div className="file-upload">

            <label htmlFor="photo">
              Choose Profile Photo
            </label>

            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              required
            />

            {photo && (
              <div className="selected-file">
                Selected: {photo.name}
              </div>
            )}

          </div>

        </div>


        {/* ========================================
            BIODATA PDF
        ======================================== */}

        <div className="form-section">

          <h2>
            Biodata PDF
          </h2>

          <p className="form-help">
            Upload exactly one PDF containing the
            complete biodata.
          </p>

          <div className="file-upload">

            <label htmlFor="pdf">
              Choose Biodata PDF
            </label>

            <input
              id="pdf"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handlePdfChange}
              required
            />

            {pdf && (
              <div className="selected-file">
                Selected: {pdf.name}
              </div>
            )}

          </div>

        </div>


        {/* ========================================
            SUBMIT
        ======================================== */}

        <div className="form-submit">

          <button
            type="submit"
            className="upload-biodata-btn"
            disabled={uploading}
          >

            {uploading
              ? "Uploading..."
              : "Upload Biodata"}

          </button>

        </div>

      </form>

    </div>
  );
}

export default AddBiodata;