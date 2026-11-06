
import { useEffect, useRef, useState } from "react";
import {
  FaWhatsapp,
  FaExternalLinkAlt,
  FaTimes,
} from "react-icons/fa";

import "./UploadBiodata.css";

// ======================================================
// BIODATA MAKER WEBSITES
// ======================================================

const biodataWebsites = [
  {
    id: "jaiswal",
    title: "Kalal / Kalwar / Kalar Community",
    description:
      "Create your community biodata for Jaiswal Vaivaahiki and sharing in WhatsApp groups and channels.",
    price: 51,
    url: "https://jaiswal-milansetu.netlify.app/",
    recommended: true,
  },
  {
    id: "byahut",
    title: "Byahut Community",
    description:
      "Create your Byahut community biodata for Jaiswal Vaivaahiki and sharing in WhatsApp groups and channels.",
    price: 51,
    url: "https://byahut-milansetu.netlify.app/",
    recommended: true,
  },
  {
    id: "general",
    title: "General Biodata Maker",
    description:
      "Create a biodata for personal use or sharing outside the Jaiswal Vaivaahiki platform.",
    price: 25,
    url: "https://milansetu.netlify.app/",
    recommended: false,
  },
];

function UploadBiodata() {
  const [showBiodataModal, setShowBiodataModal] =
    useState(false);

  const closeButtonRef = useRef(null);
  const createButtonRef = useRef(null);

  // ======================================================
  // EXISTING WHATSAPP NUMBER
  // ======================================================

  const whatsappNumber = "917050510511";

  const message =
    "Hello, I would like to add my biodata to Jaiswal Vaivaahiki. Please guide me through the process.";

  const whatsappBusinessUrl =
    `whatsapp://send?phone=${whatsappNumber}` +
    `&text=${encodeURIComponent(message)}`;

  const openWhatsappBusiness = () => {
    window.location.href = whatsappBusinessUrl;
  };

  // ======================================================
  // OPEN / CLOSE MODAL
  // ======================================================

  const openBiodataModal = () => {
    setShowBiodataModal(true);
  };

  const closeBiodataModal = () => {
    setShowBiodataModal(false);
  };

  // ======================================================
  // ESCAPE KEY, SCROLL LOCK AND FOCUS
  // ======================================================

  useEffect(() => {
    if (!showBiodataModal) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowBiodataModal(false);
      }

      if (event.key === "Tab") {
        const modal = document.querySelector(
          ".biodata-choice-modal"
        );

        if (!modal) return;

        const controls = Array.from(
          modal.querySelectorAll(
            'button:not([disabled]), a[href]'
          )
        );

        if (!controls.length) return;

        const first = controls[0];
        const last = controls[controls.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      createButtonRef.current?.focus();
    };
  }, [showBiodataModal]);

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <>
      <section className="upload-biodata">
        <div className="upload-biodata-content">

          {/* EYEBROW */}

          <span className="upload-eyebrow">
            ✦ JOIN JAISWAL VAIVAAHIKI ✦
          </span>

          {/* HEADING */}

          <h2>
            Want to Add Your Biodata?
          </h2>

          {/* DESCRIPTION */}

          <p>
            Create a professional matrimonial biodata
            using our community-specific biodata
            makers. You can share it in WhatsApp
            groups and channels and contact us
            to learn about listing it on
            Jaiswal Vaivaahiki.
          </p>

          {/* CREATE BIODATA SECTION */}

          <div className="biodata-maker-section">

            <p>
              Don't have a biodata yet?
              Choose a suitable biodata maker
              to get started.
            </p>

            <button
              ref={createButtonRef}
              type="button"
              className="biodata-maker-btn"
              onClick={openBiodataModal}
              aria-haspopup="dialog"
              aria-expanded={showBiodataModal}
            >
              <FaExternalLinkAlt
                className="biodata-maker-icon"
                aria-hidden="true"
              />

              <span>
                Create Your Biodata
              </span>
            </button>

            <p className="biodata-upload-note">
              For Jaiswal Vaivaahiki listing,
              please use the appropriate
              community biodata maker.
              Contact the administrator
              for submission and review details.
            </p>

          </div>

          {/* WHATSAPP NUMBER */}

          <div className="upload-number">
            <FaWhatsapp
              className="upload-whatsapp-icon"
              aria-hidden="true"
            />

            <span>
              7050510511
            </span>
          </div>

          {/* EXISTING WHATSAPP BUTTON */}

          <button
            type="button"
            className="whatsapp-upload-btn"
            onClick={openWhatsappBusiness}
            aria-label="Send your biodata on WhatsApp"
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
      </section>

      {/* ====================================================
          BIODATA WEBSITE SELECTION POPUP
      ==================================================== */}

      {showBiodataModal && (
        <div
          className="biodata-choice-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeBiodataModal();
            }
          }}
        >
          <div
            className="biodata-choice-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="biodata-choice-title"
            aria-describedby="biodata-choice-description"
          >

            {/* CLOSE BUTTON */}

            <button
              ref={closeButtonRef}
              type="button"
              className="biodata-choice-close"
              onClick={closeBiodataModal}
              aria-label="Close biodata selection"
            >
              <FaTimes aria-hidden="true" />
            </button>

            {/* MODAL HEADER */}

            <div className="biodata-choice-header">

              <span className="biodata-choice-eyebrow">
                ✦ JAISWAL VAIVAAHIKI ✦
              </span>

              <h3 id="biodata-choice-title">
                Choose Your Biodata Maker
              </h3>

              <p id="biodata-choice-description">
                Select the website that matches
                your community and how you
                plan to share your biodata.
              </p>

            </div>

            {/* THREE WEBSITE OPTIONS */}

            <div className="biodata-choice-list">

              {biodataWebsites.map((website) => (
                <div
                  className="biodata-choice-card"
                  key={website.id}
                >

                  <div className="biodata-choice-card-top">

                    <h4>
                      {website.title}
                    </h4>

                    <span className="biodata-choice-price">
                      ₹{website.price}
                    </span>

                  </div>

                  {website.recommended && (
                    <span className="biodata-choice-recommended">
                      For Jaiswal Vaivaahiki
                    </span>
                  )}

                  <p>
                    {website.description}
                  </p>

                  <a
                    className="biodata-choice-link"
                    href={website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>
                      Create Biodata
                    </span>

                    <FaExternalLinkAlt
                      aria-hidden="true"
                    />
                  </a>

                </div>
              ))}

            </div>

            {/* FOOTER INFORMATION */}

            <p className="biodata-choice-note">
              The prices above are for creating
              biodata using the respective
              websites. Publishing on Jaiswal
              Vaivaahiki is subject to its
              separate submission and
              approval process.
            </p>

          </div>
        </div>
      )}
    </>
  );
}

export default UploadBiodata;
