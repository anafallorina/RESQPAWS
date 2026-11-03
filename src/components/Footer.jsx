
import { Link } from "react-router-dom";
import { PawPrint, Heart, MapPin, Mail } from "lucide-react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <PawPrint size={27} />
            RESQ<span>PAWS</span>
          </Link>

          <p>
            Helping animals find safety, care,
            and loving homes. Every paw deserves hope.
          </p>

          <div className="footer-message">
            <Heart size={16} />
            Every life matters.
          </div>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/adoption">Adoption</Link>
          <Link to="/volunteer">Volunteer</Link>
          <Link to="/rescue-cases">Rescue Cases</Link>
        </div>

        <div className="footer-column">
          <h3>Get Involved</h3>
          <Link to="/report-animal">Report an Animal</Link>
          <Link to="/register">Join RESQPAWS</Link>
          <Link to="/login">Log In</Link>
        </div>

        <div className="footer-column">
          <h3>Contact Us</h3>
          <p><Mail size={16} /> Contact information coming soon</p>
          <p><MapPin size={16} /> Philippines</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 RESQPAWS. All rights reserved.</p>
        <p>Made with <Heart size={14} fill="currentColor" /> for animals.</p>
      </div>
    </footer>
  );
}

export default Footer;
