import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            Jaiswal Vaivaahiki
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li>
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>
          </li>

          <li>
            <Link to="/search" onClick={closeMenu}>
              Search Biodata
            </Link>
          </li>

          <li>
            <Link to="/gallery" onClick={closeMenu}>
              Gallery
            </Link>
          </li>

          <li>
            <Link to="/contact" onClick={closeMenu}>
              Contact
            </Link>
          </li>

          <li>
            <Link to="/admin/login" onClick={closeMenu}>
              Admin Login
            </Link>
          </li>
        </ul>

      </div>
    </nav>
  );
}

export default Navbar;
