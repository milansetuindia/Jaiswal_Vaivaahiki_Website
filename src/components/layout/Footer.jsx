//src/components/layout/Footer.jsx

import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">

      {/* ==================================================
          DECORATIVE TOP
      ================================================== */}

      <div className="footer-decoration">
        ✦
      </div>


      <div className="footer-container">

        {/* ==================================================
            BRAND
        ================================================== */}

        <div className="footer-brand">

          <h2>
            ✦ Jaiswal Vaivaahiki ✦
          </h2>

          <p>
            A community-focused matrimonial platform
            helping families find suitable life partners
            with trust and simplicity.
          </p>

          <div className="footer-symbol">
            ♥
          </div>

        </div>


        {/* ==================================================
            QUICK LINKS
        ================================================== */}

        <div className="footer-column">

          <h3>
            Quick Links
          </h3>

          <div className="footer-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/search">
              Search Biodata
            </Link>

            <Link to="/gallery">
              Gallery
            </Link>

          </div>

        </div>


        {/* ==================================================
            IMPORTANT
        ================================================== */}

        <div className="footer-column">

          <h3>
            Important
          </h3>

          <div className="footer-links">

            <Link to="/privacy">
              Privacy Policy
            </Link>

            <Link to="/terms">
              Terms & Conditions
            </Link>

            <Link to="/contact">
              Contact Us
            </Link>

          </div>

        </div>


        {/* ==================================================
            COMMUNITY
        ================================================== */}

        <div className="footer-column">

          <h3>
            Our Community
          </h3>

          <p className="footer-community-text">
            Bringing families together through
            meaningful matrimonial connections.
          </p>

          <span className="footer-heart">
            ✦ Made with care for the community ✦
          </span>

        </div>

      </div>


      {/* ==================================================
          BOTTOM
      ================================================== */}

      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} Jaiswal Vaivaahiki.
          All rights reserved.
        </p>

      </div>

    </footer>
  );
}

export default Footer;
