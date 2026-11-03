
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  PawPrint,
  MapPin,
  CalendarDays,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./RescueCases.css";

function RescueCases() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Temporary sample data for the frontend.
  // We will replace this with Firestore data later.
  const cases = [
    {
      id: "RC-001",
      animal: "Dog",
      condition: "Injured",
      location: "Sample location, Philippines",
      date: "November 1, 2026",
      status: "Pending",
      description:
        "A stray dog needs assistance and immediate assessment.",
    },
    {
      id: "RC-002",
      animal: "Cat",
      condition: "Abandoned",
      location: "Sample location, Philippines",
      date: "November 2, 2026",
      status: "In Progress",
      description:
        "A cat was reported without an owner and needs rescue assistance.",
    },
    {
      id: "RC-003",
      animal: "Dog",
      condition: "Sick",
      location: "Sample location, Philippines",
      date: "November 3, 2026",
      status: "Resolved",
      description:
        "A reported dog has received the necessary rescue assistance.",
    },
  ];

  const filters = ["All", "Pending", "In Progress", "Resolved"];

  const filteredCases = cases.filter((item) => {
    const matchesFilter =
      activeFilter === "All" || item.status === activeFilter;

    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.animal.toLowerCase().includes(search.toLowerCase()) ||
      item.condition.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <Navbar />

      <main className="rescue-page">
        <section className="rescue-header">
          <div>
            <span className="rescue-eyebrow">
              <PawPrint size={16} /> RESQPAWS COMMUNITY
            </span>

            <h1>Rescue Cases</h1>

            <p>
              View and monitor reported animals that need rescue
              assistance.
            </p>
          </div>

          <Link to="/report-animal" className="report-case-btn">
            <PawPrint size={18} />
            Report an Animal
          </Link>
        </section>

        <section className="rescue-content">
          <div className="rescue-toolbar">
            <div className="rescue-search">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search cases, animals, or locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="rescue-filter-label">
              <Filter size={18} />
              Filter by status
            </div>
          </div>

          <div className="rescue-filters">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="rescue-results-heading">
            <div>
              <h2>Reported Cases</h2>
              <p>
                {filteredCases.length}{" "}
                {filteredCases.length === 1 ? "case" : "cases"} found
              </p>
            </div>
          </div>

          {filteredCases.length > 0 ? (
            <div className="rescue-case-grid">
              {filteredCases.map((item) => (
                <article className="rescue-card" key={item.id}>
                  <div className="rescue-card-top">
                    <div className="animal-icon">
                      <PawPrint size={25} />
                    </div>

                    <span
                      className={`case-status ${item.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="rescue-card-info">
                    <span className="case-id">{item.id}</span>
                    <h3>{item.animal} - {item.condition}</h3>
                    <p>{item.description}</p>
                  </div>

                  <div className="rescue-card-details">
                    <div>
                      <MapPin size={16} />
                      <span>{item.location}</span>
                    </div>

                    <div>
                      <CalendarDays size={16} />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <button
                    className="view-case-btn"
                    type="button"
                    onClick={() =>
                      alert("Case details will be connected soon.")
                    }
                  >
                    View Details <ArrowRight size={17} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rescue-empty">
              <ClipboardList size={42} />
              <h3>No rescue cases found</h3>
              <p>
                Try another search or select a different status filter.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default RescueCases;
