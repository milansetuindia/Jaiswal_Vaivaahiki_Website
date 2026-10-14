
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
  // WHATSAPP BUSINESS URL
  // ======================================================

  const whatsappBusinessUrl =
    `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(
      message
    )}`;


  // ======================================================
  // OPEN WHATSAPP DIRECTLY
  // ======================================================

  const openWhatsappBusiness = () => {
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
            WHATSAPP BUTTON - DIRECT LINK
        ================================================== */}

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
  );
}

export default UploadBiodata;
