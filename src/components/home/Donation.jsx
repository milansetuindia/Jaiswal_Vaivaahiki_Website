// src/components/home/Donation.jsx

import { useState } from "react";
import "./Donation.css";

function Donation() {

  // ======================================================
  // DONATION UPI DETAILS
  // ======================================================

  const upiId = "7050510511-5@axl";
  const payeeName = "Rambha Jaiswal";


  // ======================================================
  // CLOUDINARY QR CODE URL
  // ======================================================

  const donationQr =
    "https://res.cloudinary.com/f4hqnuko/image/upload/v1788069632/donation-qr.jpg";


  // ======================================================
  // COPY STATUS
  // ======================================================

  const [copied, setCopied] = useState(false);


  // ======================================================
  // UPI PAYMENT LINK
  // ======================================================

  const upiUrl =
    `upi://pay?pa=${encodeURIComponent(
      upiId
    )}&pn=${encodeURIComponent(
      payeeName
    )}&cu=INR`;


  // ======================================================
  // COPY UPI ID
  // ======================================================

  const handleCopyUpi = async () => {

    try {

      await navigator.clipboard.writeText(
        upiId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {

      console.error(
        "Unable to copy UPI ID:",
        error
      );

      try {

        const textArea =
          document.createElement("textarea");

        textArea.value = upiId;

        textArea.style.position =
          "fixed";

        textArea.style.left =
          "-9999px";

        textArea.style.top =
          "0";

        document.body.appendChild(
          textArea
        );

        textArea.focus();
        textArea.select();

        document.execCommand(
          "copy"
        );

        document.body.removeChild(
          textArea
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);

      } catch (fallbackError) {

        console.error(
          "Fallback copy failed:",
          fallbackError
        );

        alert(
          `Please copy the UPI ID manually:\n\n${upiId}`
        );
      }
    }
  };


  // ======================================================
  // PAGE
  // ======================================================

  return (
    <section className="donation-section">

      {/* ==================================================
          DECORATIVE SYMBOLS
      ================================================== */}

      <div className="donation-decoration donation-decoration-left">
        ✦
      </div>

      <div className="donation-decoration donation-decoration-right">
        ✦
      </div>


      <div className="donation-content">

        {/* ==================================================
            EYEBROW
        ================================================== */}

        <span className="donation-eyebrow">
          ✦ SUPPORT JAISWAL VAIVAAHIKI ✦
        </span>


        {/* ==================================================
            ENGLISH DESCRIPTION
        ================================================== */}

        <p className="donation-description">
          Your contribution helps us maintain and improve
          Jaiswal Vaivaahiki and continue providing a
          simple and accessible matrimonial platform
          for the Kalar, Kalwar &amp; Kalal communities.
        </p>


        {/* ==================================================
            HINDI DESCRIPTION
        ================================================== */}

        <p className="donation-description donation-description-hindi">
          इस वेबसाइट के निर्माण एवं सुचारु संचालन में हो रहे खर्च में
          आप सभी का सहयोग अपेक्षित है। स्वेच्छा से सहयोग करें।
        </p>


        {/* ==================================================
            DONATION AREA
        ================================================== */}

        <div className="donation-box">


          {/* ==================================================
              QR CODE
          ================================================== */}

          <div className="donation-qr">

            <div className="donation-qr-wrapper">

              <img
                src={donationQr}
                alt="Scan QR code to support Jaiswal Vaivaahiki"
                className="donation-qr-image"
              />

            </div>


            <p className="scan-text">
              Scan to donate using any UPI app
            </p>

          </div>


          {/* ==================================================
              DONATION DETAILS
          ================================================== */}

          <div className="donation-details">

            {/* ICON */}

            <div className="donation-icon">
              ❤️
            </div>


            {/* HEADING */}

            <h3>
              Every Contribution Helps
            </h3>


            {/* DESCRIPTION */}

            <p>
              You can contribute any amount you
              are comfortable with.
            </p>


            {/* UPI ID */}

            <div className="upi-details">

              <span className="upi-label">
                UPI ID
              </span>

              <strong>
                {upiId}
              </strong>

            </div>


            {/* ACTION BUTTONS */}

            <div className="donation-actions">

              {/* COPY UPI ID */}

              <button
                type="button"
                className={`copy-upi-btn ${
                  copied
                    ? "copied"
                    : ""
                }`}
                onClick={handleCopyUpi}
                aria-label="Copy UPI ID"
              >

                <span className="copy-upi-icon">
                  {copied
                    ? "✓"
                    : "⧉"}
                </span>

                <span>
                  {copied
                    ? "UPI ID Copied"
                    : "Copy UPI ID"}
                </span>

              </button>


              {/* DONATE VIA UPI */}

              <a
                href={upiUrl}
                className="donate-upi-btn"
                aria-label="Donate using UPI"
              >

                <span className="upi-button-icon">
                  ₹
                </span>

                <span>
                  Donate via UPI
                </span>

              </a>

            </div>


            {/* ==================================================
                PAYMENT NOTE
            ================================================== */}

            <span className="donation-note">

              On mobile, Donate via UPI can open
              your UPI payment app.

              <br />

              On laptop or desktop, scan the QR
              code or use the UPI ID.

            </span>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Donation;
