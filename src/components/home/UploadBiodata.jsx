// src/components/home/UploadBiodata.jsx

import { useState } from "react";
import "./UploadBiodata.css";
import { FaWhatsapp, FaExternalLinkAlt } from "react-icons/fa";

function UploadBiodata() {

  // ======================================================
  // WHATSAPP NUMBER
  // ======================================================

  const whatsappNumber = "917050510511";


  // ======================================================
  // BIODATA MAKER LINK
  // ======================================================

  const biodataMakerUrl =
    "https://jaiswal-milansetu.netlify.app";


  // ======================================================
  // PRE-FILLED WHATSAPP MESSAGE
  // ======================================================

  const message =
    "Hello, I would like to add my biodata to Jaiswal Vaivaahiki. Please guide me through the process.";


  // ======================================================
  // WHATSAPP URL
  // ======================================================

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;


  // ======================================================
  // WHATSAPP BUSINESS URL
  // ======================================================

  const whatsappBusinessUrl =
    `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(
      message
    )}`;


  // ======================================================
  // POPUP STATE
  // ======================================================

  const [showWhatsappOptions, setShowWhatsappOptions] =
    useState(false);


  // ======================================================
  // CLOSE POPUP
  // ======================================================

  const closeWhatsappOptions = () => {
    setShowWhatsappOptions(false);
  };


  // ======================================================
  // OPEN WHATSAPP
  // ======================================================

  const openWhatsapp = () => {
    setShowWhatsappOptions(false);

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };


  // ======================================================
  // OPEN WHATSAPP BUSINESS
  // ======================================================

  const openWhatsappBusiness = () => {
    setShowWhatsappOptions(false);

    window.location.href = whatsappBusinessUrl;
  };


  // ======================================================
  // PAGE
  // ======================================================

  return (
    <section className="upload-biodata">

      <div className="upload-biodata-content">

        {/* ==================================================
            EYEBROW
        ================================================== */}

        <span className="upload-eyebrow">
          ✦ JOIN JAISWAL VAIVAAHIKI ✦
        </span>


        {/* ==================================================
            HEADING
        ================================================== */}

        <h2>
          Want to Add Your Biodata?
        </h2>


        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <p>
          To add your biodata to Jaiswal Vaivaahiki,
          please contact us on WhatsApp.
        </p>


        {/* ==================================================
            CREATE BIODATA
        ================================================== */}

        <div className="biodata-maker-section">

          <p>
            Don't have a biodata yet?
            Create your biodata online first.
          </p>

          <a
            href={biodataMakerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="biodata-maker-btn"
          >

            <FaExternalLinkAlt
              className="biodata-maker-icon"
              aria-hidden="true"
            />

            <span>
              Create Your Biodata
            </span>

          </a>


          {/* ==================================================
              IMPORTANT NOTE
          ================================================== */}

          <p className="biodata-upload-note">
            Only biodata created using the above link will be
            uploaded to the Jaiswal Vaivaahiki portal.
          </p>

        </div>


        {/* ==================================================
            WHATSAPP NUMBER
        ================================================== */}

        <div className="upload-number">

          <FaWhatsapp
            className="upload-whatsapp-icon"
            aria-hidden="true"
          />

          <span>
            7050510511
          </span>

        </div>


        {/* ==================================================
            WHATSAPP BUTTON
        ================================================== */}

        <button
          type="button"
          className="whatsapp-upload-btn"
          onClick={() => setShowWhatsappOptions(true)}
          aria-label="Choose WhatsApp to send your biodata"
        >

          <FaWhatsapp
            className="whatsapp-button-icon"
            aria-hidden="true"
          />

          <span>
            Send Your Biodata on WhatsApp
          </span>

        </button>

      </div>


      {/* ====================================================
          WHATSAPP SELECTION MODAL
      ==================================================== */}

      {showWhatsappOptions && (
        <div
          className="whatsapp-modal-overlay"
          onClick={closeWhatsappOptions}
        >

          <div
            className="whatsapp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-modal-title"
            onClick={(event) => event.stopPropagation()}
          >

            {/* ==================================================
                CLOSE BUTTON
            ================================================== */}

            <button
              type="button"
              className="whatsapp-modal-close"
              onClick={closeWhatsappOptions}
              aria-label="Close"
            >
              ×
            </button>


            {/* ==================================================
                MODAL ICON
            ================================================== */}

            <div className="whatsapp-modal-icon">
              <FaWhatsapp />
            </div>


            {/* ==================================================
                MODAL HEADING
            ================================================== */}

            <h3 id="whatsapp-modal-title">
              Choose WhatsApp
            </h3>


            {/* ==================================================
                MODAL DESCRIPTION
            ================================================== */}

            <p className="whatsapp-modal-description">
              Select how you want to contact us.
            </p>


            {/* ==================================================
                WHATSAPP OPTION
            ================================================== */}

            <button
              type="button"
              className="whatsapp-option-btn"
              onClick={openWhatsapp}
            >

              <span className="whatsapp-option-icon">
                <FaWhatsapp />
              </span>

              <span className="whatsapp-option-text">
                <strong>
                  WhatsApp
                </strong>

                <small>
                  Open WhatsApp Messenger
                </small>
              </span>

            </button>


            {/* ==================================================
                WHATSAPP BUSINESS OPTION
            ================================================== */}

            <button
              type="button"
              className="whatsapp-option-btn"
              onClick={openWhatsappBusiness}
            >

              <span className="whatsapp-option-icon">
                <FaWhatsapp />
              </span>

              <span className="whatsapp-option-text">
                <strong>
                  WhatsApp Business
                </strong>

                <small>
                  Open WhatsApp Business
                </small>
              </span>

            </button>


            {/* ==================================================
                CANCEL
            ================================================== */}

            <button
              type="button"
              className="whatsapp-cancel-btn"
              onClick={closeWhatsappOptions}
            >
              Cancel
            </button>

          </div>

        </div>
      )}

    </section>
  );
}

export default UploadBiodata;
