// src/components/home/Hero.jsx

import "./Hero.css";
import { Link } from "react-router-dom";
import heroImage from "../../assets/images/hero.png";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-image-wrapper">
        <img
          src={heroImage}
          alt="Jaiswal Vaivaahiki - Matrimonial Portal"
          className="hero-image"
        />

        {/* Invisible clickable areas over the buttons
            already present inside hero.png */}

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
