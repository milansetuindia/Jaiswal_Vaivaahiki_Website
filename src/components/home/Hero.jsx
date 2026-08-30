// src/components/home/Hero.jsx

import "./Hero.css";
import { Link } from "react-router-dom";

function Hero() {

  // ======================================================
  // CLOUDINARY HERO IMAGE
  // ======================================================

  const heroImage =
    "https://res.cloudinary.com/f4hqnuko/image/upload/v1788069654/hero.png";


  return (
    <section className="hero">

      <div className="hero-image-wrapper">

        <img
          src={heroImage}
          alt="Jaiswal Vaivaahiki - Matrimonial Portal"
          className="hero-image"
        />


        {/* ================================================
            INVISIBLE CLICKABLE AREAS OVER THE BUTTONS
            ALREADY PRESENT INSIDE hero.png
        ================================================= */}

        <Link
          to="/search"
          className="hero-click search-click"
          aria-label="Search Biodata"
        />

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
