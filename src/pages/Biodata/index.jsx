// src/pages/Biodata/index.jsx

import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import "./Biodata.css";

const API_URL = import.meta.env.VITE_API_URL;


// ======================================================
// GET FILE URL
// ======================================================

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


// ======================================================
// BIODATA COMPONENT
// ======================================================

function Biodata() {

  const { id } = useParams();

  const location = useLocation();

  const navigate = useNavigate();


  const [biodata, setBiodata] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [viewingPdf, setViewingPdf] =
    useState(false);

  const [downloadingPdf, setDownloadingPdf] =
    useState(false);




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


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.message ||
            "Failed to fetch biodata."
          );

        }



        console.log("BIODATA API RESPONSE:", result.biodata);
        setBiodata(
          result.biodata
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
// BACK TO PREVIOUS PAGE
// ======================================================

const handleBack = () => {

  // ====================================================
  // RETURN TO SEARCH PAGE
  // ====================================================

  if (location.state?.fromSearch) {

    navigate(
      "/search",
      {
        replace: true,

        state: {
          restoreSearch: true,

          page:
            location.state.page || 1,

          scrollPosition:
            location.state.scrollPosition,

          selectedProfileId:
            location.state.selectedProfileId,
        },
      }
    );

    return;

  }


  // ====================================================
  // RETURN TO HOME PAGE
  // ====================================================

  if (location.state?.fromHome) {

    navigate(
      "/",
      {
        replace: true,

        state: {
          restoreHome: true,

          page:
            location.state.page || 1,

          scrollPosition:
            location.state.scrollPosition,

          selectedProfileId:
            location.state.selectedProfileId,
        },
      }
    );

    return;

  }


  // ====================================================
  // FALLBACK
  // ====================================================

  navigate("/");

};



  // ======================================================
  // WHATSAPP CONTACT - DIRECT BUSINESS LINK
  // ======================================================

  const cleanContactNumber = String(
    biodata?.contactNumber || ""
  ).replace(/\D/g, "");


  const whatsappMessage =
    `🙏 Namaste,

  This message is regarding your biodata profile listed on the Jaiswal Vaivaahiki website.`;


  // ======================================================
  // WHATSAPP BUSINESS URL
  // ======================================================

  const biodataWhatsappBusinessUrl =
    `whatsapp://send?phone=91${cleanContactNumber}&text=${encodeURIComponent(
      whatsappMessage
    )}`;

  // ======================================================
  // OPEN WHATSAPP DIRECTLY
  // ======================================================

  const openWhatsappBusiness = () => {
    window.location.href = biodataWhatsappBusinessUrl;
  };

  // ======================================================
  // CONTACT ADMIN FOR ANY QUERY
  // ======================================================

  const adminWhatsappNumber = "917050510511";



  const adminWhatsappMessage =
    `🙏 Namaste Jaiswal Vaivaahiki Admin,

  I have a query regarding Profile Number: ${biodata?.profileNumber || "Not assigned"} on Jaiswal Vaivaahiki.

  Please help me.`;



  const adminWhatsappUrl =
    `whatsapp://send?phone=${adminWhatsappNumber}&text=${encodeURIComponent(
      adminWhatsappMessage
    )}`;

  const contactAdmin = () => {
    window.location.href = adminWhatsappUrl;
  };




  // ======================================================
  // VIEW BIODATA PDF
  // ======================================================

  const handleViewPdf = async () => {

    if (!biodata?.biodataPdf) {
      return;
    }


    /*
     * Open the new tab immediately.
     *
     * This is important for mobile/tablet browsers
     * because opening the tab after an async fetch
     * can sometimes be treated as a blocked popup.
     */

    const newTab =
      window.open(
        "",
        "_blank"
      );


    if (!newTab) {

      alert(
        "Please allow pop-ups for this website to view the PDF."
      );

      return;

    }


    try {

      setViewingPdf(true);


      /*
       * Show a temporary message while
       * the PDF is being loaded.
       */

      newTab.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Loading Biodata PDF...</title>

            <style>
              body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                background: #f7f7fb;
                color: #7d0000;
              }

              .message {
                text-align: center;
                padding: 30px;
              }

              h2 {
                margin-bottom: 10px;
              }

              p {
                color: #666;
              }
            </style>
          </head>

          <body>
            <div class="message">
              <h2>Loading Biodata PDF...</h2>
              <p>Please wait.</p>
            </div>
          </body>
        </html>
      `);

      newTab.document.close();


      // ==================================================
      // FETCH PDF
      // ==================================================

      const pdfUrl =
        getFileUrl(
          biodata.biodataPdf
        );


      const response =
        await fetch(pdfUrl);


      if (!response.ok) {

        throw new Error(
          "Failed to load PDF"
        );

      }


      // ==================================================
      // CONVERT RESPONSE TO BLOB
      // ==================================================

      const blob =
        await response.blob();


      /*
       * Make sure the browser receives
       * the correct PDF MIME type.
       */

      const pdfBlob =
        blob.type === "application/pdf"
          ? blob
          : new Blob(
              [blob],
              {
                type:
                  "application/pdf",
              }
            );


      // ==================================================
      // CREATE TEMPORARY PDF URL
      // ==================================================

      const blobUrl =
        window.URL.createObjectURL(
          pdfBlob
        );


      /*
       * Navigate the already-opened tab
       * to the Blob PDF URL.
       */

      newTab.location.href =
        blobUrl;


      /*
       * Do NOT revoke the Blob URL immediately.
       *
       * The PDF viewer needs time to load it.
       */

      setTimeout(() => {

        window.URL.revokeObjectURL(
          blobUrl
        );

      }, 60000);


    } catch (error) {

      console.error(
        "PDF view error:",
        error
      );


      /*
       * Close the empty/loading tab
       * if something went wrong.
       */

      try {

        newTab.close();

      } catch {
        // Ignore close errors
      }


      alert(
        "Unable to open the biodata PDF. Please try again."
      );

    } finally {

      setViewingPdf(false);

    }

  };


  // ======================================================
  // DOWNLOAD BIODATA PDF
  // ======================================================

  const handleDownloadPdf = async () => {

    if (!biodata?.biodataPdf) {
      return;
    }


    try {

      setDownloadingPdf(true);


      const pdfUrl =
        getFileUrl(
          biodata.biodataPdf
        );


      const response =
        await fetch(pdfUrl);


      if (!response.ok) {

        throw new Error(
          "Failed to download PDF"
        );

      }


      const blob =
        await response.blob();


      /*
       * Make sure the Blob is treated as a PDF.
       */

      const pdfBlob =
        blob.type === "application/pdf"
          ? blob
          : new Blob(
              [blob],
              {
                type:
                  "application/pdf",
              }
            );


      const blobUrl =
        window.URL.createObjectURL(
          pdfBlob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        blobUrl;


      link.download =
        `${biodata.name || "Biodata"}-Biodata.pdf`;


      document.body.appendChild(
        link
      );


      link.click();


      document.body.removeChild(
        link
      );


      /*
       * Give the browser a moment
       * before releasing the object URL.
       */

      setTimeout(() => {

        window.URL.revokeObjectURL(
          blobUrl
        );

      }, 1000);


    } catch (error) {

      console.error(
        "PDF download error:",
        error
      );


      alert(
        "Unable to download the biodata PDF. Please try again."
      );

    } finally {

      setDownloadingPdf(false);

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

          <button
            type="button"
            onClick={handleBack}
          >
            ← Go Back
          </button>

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

          <button
            type="button"
            onClick={handleBack}
          >
            ← Go Back
          </button>

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

        {/* BACK BUTTON - MOBILE AND TABLET ONLY */}

        <button
          type="button"
          onClick={handleBack}
          className="biodata-back-btn biodata-mobile-back"
        >
          ← Back
        </button>

        <div className="profile-photo-container">


          {biodata.photo ? (

            <img
              src={getFileUrl(
                biodata.photo
              )}
              alt={biodata.name}
            />

          ) : (

            <div className="no-profile-photo">
              No Photo
            </div>

          )}

        </div>


        <div className="profile-info">

        <button
          type="button"
          onClick={handleBack}
          className="biodata-back-btn biodata-top-back"
        >
          ← Back
        </button>

        <h1>
          {biodata.name}
        </h1>

        {/* PROFILE NUMBER */}

        <p className="biodata-profile-number">
          <strong>Profile Number:</strong>{" "}
          {biodata.profileNumber || "Not assigned"}
        </p>



          <p>

            <strong>
              Age:
            </strong>{" "}

            {biodata.age
              ? `${biodata.age} Years`
              : "Not specified"}

          </p>


          <p>

            <strong>
              Diet:
            </strong>{" "}

            {biodata.diet ||
              "Not specified"}

          </p>


          <p>

            <strong>
              Annual Income:
            </strong>{" "}

            {biodata.income !== null &&
            biodata.income !== undefined &&
            biodata.income !== ""
              ? `₹${biodata.income} Lakh`
              : "Not specified"}

          </p>


          {/* ==================================================
              EDUCATION / QUALIFICATION
          ================================================== */}

          <p>
            <strong>
              Qualification:
            </strong>{" "}

            {biodata.education ||
              "Not specified"}
          </p>


          {/* ==================================================
              OCCUPATION / PROFESSION
          ================================================== */}

          <p>
            <strong>
              Profession:
            </strong>{" "}

            {biodata.occupation ||
              "Not specified"}
          </p>





          <p>

            <strong>
              Gender:
            </strong>{" "}

            {biodata.gender ||
              "Not specified"}

          </p>



          {/* ==================================================
              HEIGHT
          ================================================== */}

          <p>
            <strong>
              Height:
            </strong>{" "}

            {biodata.height ||
              "Not specified"}
          </p>



          <p>

            <strong>
              Marital Status:
            </strong>{" "}

            {biodata.maritalStatus ||
              "Not specified"}

          </p>


          <p>

            <strong>
              Manglik Status:
            </strong>{" "}

            {biodata.manglikStatus ||
              "Not specified"}

          </p>


          <p>

            <strong>
              Caste:
            </strong>{" "}

            {biodata.caste ||
              "Not specified"}

          </p>


          <p>

            <strong>
              Sub-caste:
            </strong>{" "}

            {biodata.subCaste ||
              "Not specified"}

          </p>


          <p>

            <strong>
              City:
            </strong>{" "}

            {biodata.city ||
              "Not specified"}

          </p>


          <p>

            <strong>
              State:
            </strong>{" "}

            {biodata.state ||
              "Not specified"}

          </p>


          <p>

            <strong>
              Added:
            </strong>{" "}

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
          CONTACT / WHATSAPP
      ================================================== */}


      {biodata.contactNumber &&
          biodata.showWhatsapp !== false && (

        <div className="biodata-contact-section">

          <button
            type="button"
            className="biodata-whatsapp-btn"
            onClick={openWhatsappBusiness}
            aria-label="Contact this profile on WhatsApp"
          >

            <span className="biodata-whatsapp-icon">
              <FaWhatsapp />
            </span>

            <span>
              Contact on WhatsApp
            </span>

          </button>

        </div>
      )}


      {/* ==================================================
            CONTACT ADMIN BUTTON
      ================================================== */}

      <div className="biodata-contact-section">

        <button
          type="button"
          className="biodata-whatsapp-btn contact-admin-btn"
          onClick={contactAdmin}
          aria-label="Contact admin for any query"
        >
          <span className="biodata-whatsapp-icon">
              <FaWhatsapp />
          </span>

          <span>
              Contact Admin for Any Query
          </span>
        </button>

      </div>








        {/* ==================================================
            BIODATA PDF - ADMIN VISIBILITY SETTINGS
        ================================================== */}

        {biodata.biodataPdf &&
          (
            biodata.showViewPdf !== false ||
            biodata.showDownloadPdf !== false
          ) && (

            <div className="section">

              <h2>
                Biodata PDF
              </h2>

              <p>
                View or download the complete biodata document.
              </p>

              <div className="pdf-buttons">

                {/* VIEW PDF BUTTON */}

                {biodata.showViewPdf !== false && (

                  <button
                    type="button"
                    onClick={handleViewPdf}
                    className="pdf-btn view-pdf-btn"
                    disabled={viewingPdf}
                  >
                    {viewingPdf
                      ? "Opening PDF..."
                      : "View Biodata PDF"}
                  </button>

                )}

                {/* DOWNLOAD PDF BUTTON */}

                {biodata.showDownloadPdf !== false && (

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="pdf-btn download-pdf-btn"
                    disabled={downloadingPdf}
                  >
                    {downloadingPdf
                      ? "Downloading..."
                      : "Download Biodata PDF"}
                  </button>

                )}

              </div>

            </div>

        )}




      {/* ==================================================
          BACK BUTTON
      ================================================== */}

      <div className="biodata-back">
        <button
          type="button"
          onClick={handleBack}
          className="biodata-back-btn"
        >
          ← Back
        </button>
      </div>

    </div>
  );
}

export default Biodata;
