import "./Hero.css";
import { Link } from "react-router-dom";
import heroImage from "../../assets/images/hero.png";

function Hero() {
  return (
    <section
      className="hero"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${heroImage})`,
      }}
    >
      <div className="hero-content">


        <div className="hero-buttons">
          <Link to="/search" className="primary-btn">
            Search Biodata
          </Link>

          <Link to="/gallery" className="secondary-btn">
            View Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
