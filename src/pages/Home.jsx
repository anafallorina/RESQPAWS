
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import {
  PawPrint,
  Heart,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Search,
  HandHeart
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Home.css";

function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // CHECK USER LOGIN STATUS
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // REPORT BUTTON DESTINATION
  const reportLink = currentUser
    ? "/report-animal"
    : "/login";

  return (
    <div className="home-page">
      <Navbar />

      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="hero-content">

          <span className="section-tag">
            <PawPrint size={15} />
            EVERY PAW DESERVES HOPE
          </span>

          <h1>
            A Little Help Can
            <br />
            Make a <span>Big Difference.</span>
          </h1>

          <p>
            RESQPAWS connects caring people with animals
            in need. Report, rescue, and help give every
            animal a chance at a better life.
          </p>

          <div className="hero-buttons">

            {/* CONDITIONAL LOGIN / REPORT BUTTON */}
            <Link
              to={reportLink}
              className="primary-btn"
              onClick={(e) => {
                if (authLoading) {
                  e.preventDefault();
                }
              }}
              style={{
                pointerEvents: authLoading ? "none" : "auto",
                opacity: authLoading ? 0.7 : 1
              }}
            >
              {currentUser ? "Report an Animal" : "LOG IN"}
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/adoption"
              className="secondary-btn"
            >
              Find a Companion
            </Link>

          </div>

          <div className="hero-note">
            <Heart size={17} />
            Together, we can make a difference.
          </div>

        </div>

        <div className="hero-image">

          <div className="hero-image-circle">
            <PawPrint size={125} />
          </div>

          <div className="floating-card">
            <Heart size={20} fill="currentColor" />

            <div>
              <strong>Be Their Hope</strong>
              <span>Every action matters.</span>
            </div>
          </div>

        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="home-about">

        <div className="about-heading">
          <span className="section-tag">
            WHAT WE DO
          </span>

          <h2>Making Animal Rescue Easier</h2>

          <p>
            A platform that brings communities together
            to help animals find safety, care, and loving homes.
          </p>
        </div>

        <div className="feature-grid">

          {/* REPORT ANIMALS */}
          <div className="feature-card">

            <div className="feature-icon pink-icon">
              <Search size={27} />
            </div>

            <h3>Report Animals</h3>

            <p>
              Report stray, injured, or abandoned animals
              that need immediate attention.
            </p>

            <Link to={reportLink}>
              {currentUser ? "Make a Report" : "Log In to Report"}
              <ArrowRight size={16} />
            </Link>

          </div>

          {/* TRACK RESCUE CASES */}
          <div className="feature-card">

            <div className="feature-icon green-icon">
              <ShieldCheck size={27} />
            </div>

            <h3>Track Rescue Cases</h3>

            <p>
              Stay updated on reported animals and
              follow the progress of rescue cases.
            </p>

            <Link to="/rescue-cases">
              View Cases
              <ArrowRight size={16} />
            </Link>

          </div>

          {/* ADOPTION */}
          <div className="feature-card">

            <div className="feature-icon pink-icon">
              <Heart size={27} />
            </div>

            <h3>Find a Loving Home</h3>

            <p>
              Discover animals looking for a family
              and give them a second chance.
            </p>

            <Link to="/adoption">
              Explore Adoption
              <ArrowRight size={16} />
            </Link>

          </div>

        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="home-cta">

        <div>
          <span className="section-tag">
            BE PART OF THE CHANGE
          </span>

          <h2>They Need Us. We Need You.</h2>

          <p>
            Join the RESQPAWS community and help create
            a safer and kinder world for animals.
          </p>
        </div>

      </section>

      <Footer />

    </div>
  );
}

export default Home;
