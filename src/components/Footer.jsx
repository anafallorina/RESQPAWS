
  import { Link } from "react-router-dom";
  import {
    PawPrint,
    Heart,
    MapPin,
    Mail,
    ArrowUpRight,
  } from "lucide-react";
  import "./Footer.css";

  function Footer() {
    return (
      <footer className="footer">
        <div className="footer-main">
          {/* BRAND */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <PawPrint size={27} strokeWidth={2.2} />
              <span className="footer-logo-text">
                RESQ<span>PAWS</span>
              </span>
            </Link>

            <p className="footer-description">
              Helping animals find safety, care, and loving homes.
              Every paw deserves hope.
            </p>

            <div className="footer-message">
              <Heart size={16} />
              <span>Every life matters.</span>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="footer-column">
            <h3>Explore</h3>
            <Link to="/">Home</Link>
            <Link to="/adoption">Adoption</Link>
            <Link to="/volunteer">Volunteer</Link>
            <Link to="/rescue-cases">Rescue Cases</Link>
          </div>

          {/* GET INVOLVED */}
          <div className="footer-column">
            <h3>Get Involved</h3>
            <Link to="/report-animal">Report an Animal</Link>
            <Link to="/register">Join RESQPAWS</Link>
            <Link to="/login">Log In</Link>
          </div>

          {/* CONTACT */}
          <div className="footer-column footer-contact">
            <h3>Contact</h3>

            <p>
              <Mail size={17} />
              <span>Contact information coming soon</span>
            </p>

            <p>
              <MapPin size={17} />
              <span>Philippines</span>
            </p>

            <Link to="/report-animal" className="footer-contact-link">
              Need help with an animal?
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 RESQPAWS. All rights reserved.</p>

          <p className="footer-credit">
              Made with <Heart size={14} fill="currentColor" /> for animals.
          </p>
        </div>

      </footer>
    );
  }

  export default Footer;
