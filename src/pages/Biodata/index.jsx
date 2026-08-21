// src/pages/Biodata/index.jsx

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Biodata.css";

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

function Biodata() {
  const { id } = useParams();

  const [biodata, setBiodata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // FETCH BIODATA
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
              "Failed to fetch biodata."
          );
        }

        setBiodata(result.biodata);

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
  // DOWNLOAD BIODATA PDF
  // ======================================================

  const handleDownloadPdf = async () => {
    if (!biodata?.biodataPdf) {
      return;
    }

    try {
      const pdfUrl = getFileUrl(biodata.biodataPdf);

      const response = await fetch(pdfUrl);

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `${biodata.name || "Biodata"}-Biodata.pdf`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error(
        "PDF download error:",
        error
      );

      alert(
        "Unable to download the biodata PDF. Please try again."
      );
    }
  };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="biodata-page">

        <div className="biodata-message">
          <h2>
            Loading Biodata...
          </h2>

          <p>
            Please wait while we load the profile.
          </p>
        </div>

      </div>
    );
  }


  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="biodata-page">

        <div className="biodata-message error">

          <h2>
            Unable to load biodata
          </h2>

          <p>
            {error}
          </p>

          <Link to="/search">
            Back to Search
          </Link>

        </div>

      </div>
    );
  }


  // ======================================================
  // BIODATA NOT FOUND
  // ======================================================

  if (!biodata) {
    return (
      <div className="biodata-page">

        <div className="biodata-message">

          <h2>
            Biodata Not Found
          </h2>

          <p>
            This profile may have been removed
            or does not exist.
          </p>

          <Link to="/search">
            Back to Search
          </Link>

        </div>

      </div>
    );
  }


  // ======================================================
  // PROFILE
  // ======================================================

  return (
    <div className="biodata-page">

      {/* ==================================================
          PROFILE HEADER
      ================================================== */}

      <div className="profile-header">

        <div className="profile-photo-container">

          {biodata.photo ? (
            <img
              src={getFileUrl(biodata.photo)}
              alt={biodata.name}
            />
          ) : (
            <div className="no-profile-photo">
              No Photo
            </div>
          )}

        </div>


        <div className="profile-info">

          <h1>
            {biodata.name}
          </h1>

          <p>
            <strong>Age:</strong>{" "}
            {biodata.age
              ? `${biodata.age} Years`
              : "Not specified"}
          </p>

          <p>
            <strong>Annual Income:</strong>{" "}
            {biodata.income !== null &&
            biodata.income !== undefined &&
            biodata.income !== ""
              ? `₹${biodata.income} Lakh`
              : "Not specified"}
          </p>

          <p>
            <strong>Gender:</strong>{" "}
            {biodata.gender ||
              "Not specified"}
          </p>

          <p>
            <strong>Marital Status:</strong>{" "}
            {biodata.maritalStatus ||
              "Not specified"}
          </p>

          <p>
            <strong>Manglik Status:</strong>{" "}
            {biodata.manglikStatus ||
              "Not specified"}
          </p>

          <p>
            <strong>Caste:</strong>{" "}
            {biodata.caste ||
              "Not specified"}
          </p>

          <p>
            <strong>Sub-caste:</strong>{" "}
            {biodata.subCaste ||
              "Not specified"}
          </p>

          <p>
            <strong>City:</strong>{" "}
            {biodata.city ||
              "Not specified"}
          </p>

          <p>
            <strong>State:</strong>{" "}
            {biodata.state ||
              "Not specified"}
          </p>

          <p>
            <strong>Added:</strong>{" "}
            {biodata.createdAt
              ? new Date(
                  biodata.createdAt
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )
              : "Date not available"}
          </p>

        </div>

      </div>


      {/* ==================================================
          EDUCATION
      ================================================== */}

      <div className="section">

        <h2>
          Education
        </h2>

        <div className="details-grid">

          <p>
            <strong>
              Qualification:
            </strong>{" "}
            {biodata.education ||
              "Not specified"}
          </p>

        </div>

      </div>


      {/* ==================================================
          OCCUPATION
      ================================================== */}

      <div className="section">

        <h2>
          Occupation
        </h2>

        <div className="details-grid">

          <p>
            <strong>
              Profession:
            </strong>{" "}
            {biodata.occupation ||
              "Not specified"}
          </p>

        </div>

      </div>


      {/* ==================================================
          BIODATA PDF
      ================================================== */}

      <div className="section">

        <h2>
          Biodata PDF
        </h2>

        <p>
          View or download the complete
          biodata document.
        </p>

        {biodata.biodataPdf ? (

          <div className="pdf-buttons">

            {/* VIEW PDF */}

            <a
              href={getFileUrl(biodata.biodataPdf)}
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-btn view-pdf-btn"
            >
              View Biodata PDF
            </a>


            {/* DOWNLOAD PDF */}

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="pdf-btn download-pdf-btn"
            >
              Download Biodata PDF
            </button>

          </div>

        ) : (

          <p>
            Biodata PDF is not available.
          </p>

        )}

      </div>


      {/* ==================================================
          BACK TO SEARCH
      ================================================== */}

      <div className="biodata-back">

        <Link to="/search">
          ← Back to Search
        </Link>

      </div>

    </div>
  );
}

export default Biodata;
