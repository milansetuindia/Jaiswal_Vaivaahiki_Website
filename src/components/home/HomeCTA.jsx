// src/components/home/HomeCTA.jsx

import { Link } from "react-router-dom";
import "./HomeCTA.css";

function HomeCTA() {
  return (
    <section className="home-cta">

      {/* ==================================================
          DECORATIVE ICON
          ONLY THIS ICON FLIPS
      ================================================== */}

      <div className="cta-flip-icon">

        <div className="cta-flip-icon-inner">

          {/* FRONT - MAROON */}
          <div className="cta-icon-front">
            ❤️
          </div>

          {/* BACK - GOLDEN */}
          <div className="cta-icon-back">
            ✦
          </div>

        </div>

      </div>


      {/* ==================================================
          DECORATIONS
      ================================================== */}

      <div className="cta-decoration cta-decoration-left">
        ✦
      </div>

      <div className="cta-decoration cta-decoration-right">
        ✦
      </div>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="cta-content">

        <span className="cta-eyebrow">
          ✦ YOUR SEARCH STARTS HERE ✦
        </span>

        <h2>
          Ready to Find Your
          <span> Perfect Match?</span>
        </h2>

        <p>
          Explore suitable matrimonial profiles
          from the Jaiswal community and take
          the first step toward finding a
          compatible life partner.
        </p>


        {/* ==================================================
            BUTTONS
        ================================================== */}

        <div className="cta-buttons">

          <Link
            to="/search"
            className="cta-primary"
          >
            Search Biodata
          </Link>

          <Link
            to="/gallery"
            className="cta-secondary"
          >
            View Gallery
          </Link>

        </div>

      </div>

    </section>
  );
}

export default HomeCTA;