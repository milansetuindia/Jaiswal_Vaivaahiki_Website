// src/components/home/Hero.jsx

import "./Hero.css";
import { Link } from "react-router-dom";

function Hero() {

  // ======================================================
  // CLOUDINARY HERO IMAGE
  // Automatically optimized format and quality
  // Maximum width: 1600px
  // ======================================================

  const heroImage =
    "https://res.cloudinary.com/f4hqnuko/image/upload/f_auto,q_auto,w_1600/v1788069654/hero.png";


  // ======================================================
  // PAGE
  // ======================================================

  return (
    <section className="hero">

      <div className="hero-image-wrapper">

        {/* ==================================================
            HERO IMAGE
        ================================================== */}

        <img
          src={heroImage}
          alt="Jaiswal Vaivaahiki - Matrimonial Portal"
          className="hero-image"
          decoding="async"
        />


        {/* ==================================================
            INVISIBLE CLICKABLE AREA
            SEARCH BIODATA BUTTON
        ================================================== */}

        <Link
          to="/search"
          className="hero-click search-click"
          aria-label="Search Biodata"
        />


        {/* ==================================================
            INVISIBLE CLICKABLE AREA
            VIEW GALLERY BUTTON
        ================================================== */}

        <Link
          to="/gallery"
          className="hero-click gallery-click"
          aria-label="View Gallery"
        />

      </div>

    </section>
  );
}

export default Hero;
