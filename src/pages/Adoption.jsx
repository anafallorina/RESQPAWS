
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Heart, Search, PawPrint } from "lucide-react";
import { useState } from "react";
import "./Adoption.css";

function Adoption() {
  const [search, setSearch] = useState("");
  const [animalType, setAnimalType] = useState("All");

  return (
    <div className="adoption-page">
      <Navbar />

      {/* Hero Section */}
      <section className="adoption-hero">
        <div>
          <span className="section-tag">FIND YOUR NEW BEST FRIEND</span>
          <h1>Give Them a Home.<br /><span>Give Them Love.</span></h1>
          <p>
            Every animal deserves a loving family.
            Find your perfect companion and give them
            the second chance they deserve.
          </p>
        </div>

        <div className="adoption-hero-icon">
          <PawPrint size={130} />
        </div>
      </section>

      {/* Available Animals */}
      <section className="adoption-content">
        <div className="adoption-heading">
          <span className="section-tag">MEET YOUR COMPANION</span>
          <h2>Animals Looking for a Home</h2>
          <p>Browse our animals and find a friend to love.</p>
        </div>

        {/* Search and Filter */}
        <div className="adoption-filters">
          <div className="adoption-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search animals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={animalType}
            onChange={(e) => setAnimalType(e.target.value)}
          >
            <option value="All">All Animals</option>
            <option value="Dog">Dogs</option>
            <option value="Cat">Cats</option>
          </select>
        </div>

        {/* Empty State */}
        <div className="adoption-empty">
          <div className="empty-icon">
            <Heart size={35} />
          </div>
          <h3>No Adoption Listings Yet</h3>
          <p>
            Animals available for adoption will appear here
            once they have been added by our rescue team.
          </p>
        </div>
      </section>

      {/* Adoption Call to Action */}
      <section className="adoption-cta">
        <h2>Every animal deserves a second chance.</h2>
        <p>Help us create a community where every paw finds a home.</p>
        <a href="/register">Join RESQPAWS</a>
      </section>

      <Footer />
    </div>
  );
}

export default Adoption;
