
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  PawPrint,
  MapPin,
  CalendarDays,
  ArrowRight,
  ClipboardList,
  X,
  LoaderCircle,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./RescueCases.css";

function formatDate(timestamp) {
  if (!timestamp) return "Date unavailable";

  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function RescueCases() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);

  // FETCH ALL PUBLIC RESCUE REPORTS FROM FIRESTORE
  useEffect(() => {
    const reportsQuery = query(
      collection(db, "rescueReports"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const reports = snapshot.docs.map((document) => {
          const data = document.data();

          return {
            id: document.id,
            animal: data.animalType || "Unknown Animal",
            condition: data.condition || "Not specified",
            location:
              data.address ||
              data.locationDescription ||
              "Location not provided",
            locationDescription: data.locationDescription || "",
            date: formatDate(data.createdAt),
            status: data.status || "Pending",
            description:
              data.description || "No description provided.",
            photoUrl: data.photoUrl || null,
            coordinates: data.location || null,
          };
        });

        setCases(reports);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Error fetching rescue reports:", err);
        setError(
          "Unable to load rescue reports. Please check your connection and Firestore permissions."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filters = ["All", "Pending", "In Progress", "Resolved"];

  // SEARCH AND FILTER REPORTS
  const filteredCases = cases.filter((item) => {
    const matchesFilter =
      activeFilter === "All" || item.status === activeFilter;

    const searchText = search.toLowerCase();

    const matchesSearch = [
      item.id,
      item.animal,
      item.condition,
      item.location,
      item.locationDescription,
      item.description,
    ].some((value) =>
      String(value).toLowerCase().includes(searchText)
    );

    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <Navbar />

      <main className="rescue-page">
        <section className="rescue-header">
          <div>
            <span className="rescue-eyebrow">
              <PawPrint size={16} />
              RESQPAWS COMMUNITY
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
          {/* SEARCH AND FILTER */}
          <div className="rescue-toolbar">
            <div className="rescue-search">
              <Search size={19} />

              <input
                type="text"
                placeholder="Search cases, animals, or locations..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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
                type="button"
                className={`filter-btn ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* RESULTS HEADING */}
          <div className="rescue-results-heading">
            <div>
              <h2>Reported Cases</h2>

              <p>
                {loading
                  ? "Loading reports..."
                  : `${filteredCases.length} ${
                      filteredCases.length === 1 ? "case" : "cases"
                    } found`}
              </p>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rescue-empty">
              <LoaderCircle size={38} className="loading-icon" />
              <h3>Loading rescue reports...</h3>
              <p>Please wait while we retrieve the reports.</p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rescue-empty">
              <AlertCircle size={42} />
              <h3>Unable to load reports</h3>
              <p>{error}</p>
            </div>
          )}

          {/* EMPTY DATABASE */}
          {!loading && !error && cases.length === 0 && (
            <div className="rescue-empty">
              <ClipboardList size={42} />
              <h3>No rescue cases yet</h3>
              <p>
                No animal reports have been submitted yet.
              </p>
            </div>
          )}

          {/* CASE CARDS */}
          {!loading && !error && filteredCases.length > 0 && (
            <div className="rescue-case-grid">
              {filteredCases.map((item) => (
                <article className="rescue-card" key={item.id}>
                  <div className="rescue-card-top">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.animal}
                        className="rescue-animal-photo"
                      />
                    ) : (
                      <div className="animal-icon">
                        <PawPrint size={25} />
                      </div>
                    )}

                    <span
                      className={`case-status ${
                        item.status.toLowerCase().replace(/\s+/g, "-")
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="rescue-card-info">
                    <span className="case-id">
                      Report ID: {item.id.slice(0, 8)}
                    </span>

                    <h3>
                      {item.animal} - {item.condition}
                    </h3>

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
                    onClick={() => setSelectedCase(item)}
                  >
                    View Details
                    <ArrowRight size={17} />
                  </button>
                </article>
              ))}
            </div>
          )}

          {/* NO SEARCH RESULTS */}
          {!loading &&
            !error &&
            cases.length > 0 &&
            filteredCases.length === 0 && (
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

      {/* REPORT DETAILS MODAL */}
      {selectedCase && (
        <div
          className="case-modal-overlay"
          onClick={() => setSelectedCase(null)}
        >
          <div
            className="case-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="case-modal-header">
              <h2>Report Details</h2>

              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                aria-label="Close report details"
              >
                <X size={21} />
              </button>
            </div>

            {selectedCase.photoUrl ? (
              <img
                src={selectedCase.photoUrl}
                alt={selectedCase.animal}
                className="case-modal-photo"
              />
            ) : (
              <div className="case-modal-no-photo">
                <ImageIcon size={35} />
                <span>No animal photo uploaded</span>
              </div>
            )}

            <span
              className={`case-status ${
                selectedCase.status.toLowerCase().replace(/\s+/g, "-")
              }`}
            >
              {selectedCase.status}
            </span>

            <h3>
              {selectedCase.animal} - {selectedCase.condition}
            </h3>

            <p>{selectedCase.description}</p>

            <div className="case-modal-details">
              <div>
                <strong>Report ID</strong>
                <span>{selectedCase.id}</span>
              </div>

              <div>
                <strong>Location</strong>
                <span>{selectedCase.location}</span>
              </div>

              {selectedCase.locationDescription && (
                <div>
                  <strong>Additional Location Details</strong>
                  <span>{selectedCase.locationDescription}</span>
                </div>
              )}

              <div>
                <strong>Date Submitted</strong>
                <span>{selectedCase.date}</span>
              </div>

              {selectedCase.coordinates && (
                <div>
                  <strong>Coordinates</strong>
                  <span>
                    {selectedCase.coordinates.latitude},{" "}
                    {selectedCase.coordinates.longitude}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="view-case-btn"
              onClick={() => setSelectedCase(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default RescueCases;
