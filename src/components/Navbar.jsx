
import { Link, NavLink } from "react-router-dom";
import { PawPrint, Menu, X } from "lucide-react";
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        <PawPrint size={27} />
        <span>RESQ<span className="logo-pink">PAWS</span></span>
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      <div className={`navbar-links ${menuOpen ? "show-menu" : ""}`}>
        <NavLink to="/" onClick={closeMenu}>Home</NavLink>
        <NavLink to="/adoption" onClick={closeMenu}>Adoption</NavLink>
        <NavLink to="/volunteer" onClick={closeMenu}>Volunteer</NavLink>
        <NavLink to="/rescue-cases" onClick={closeMenu}>Rescue Cases</NavLink>

        <div className="navbar-buttons">
          <Link to="/login" className="login-btn" onClick={closeMenu}>
            Log In
          </Link>
          <Link to="/register" className="register-btn" onClick={closeMenu}>
            Join Us
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
