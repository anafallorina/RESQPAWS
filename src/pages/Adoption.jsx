
import { useEffect, useState } from "react";
import {
  Heart,
  Search,
  PawPrint,
  CalendarDays,
  Venus,
  Mars,
  ArrowRight,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

import {
  collection,
  onSnapshot,
  serverTimestamp,
  doc,
  writeBatch,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Adoption.css";

function Adoption() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [animalType, setAnimalType] = useState("All");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    reason: "",
    experience: "",
  });

  // LOAD AVAILABLE ANIMALS
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "adoptionListings"),
      (snapshot) => {
        const availableAnimals = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .filter((animal) => animal.status === "Available");

        setListings(availableAnimals);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Error loading adoption listings:", err);
        setError("Unable to load adoption listings. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // RESTORE SELECTED ANIMAL AFTER LOGIN
  useEffect(() => {
    const animalId = searchParams.get("animalId");
    const shouldApply = searchParams.get("apply");

    if (!animalId || shouldApply !== "1" || !auth.currentUser) {
      return;
    }

    const animal = listings.find((item) => item.id === animalId);

    if (animal) {
      setSelectedAnimal(animal);
      setSuccess("");
    }
  }, [listings, searchParams]);

  // PREFILL ACCOUNT INFORMATION
  useEffect(() => {
    if (!selectedAnimal || !auth.currentUser) return;

    setForm((previous) => ({
      ...previous,
      fullName:
        previous.fullName || auth.currentUser.displayName || "",
      email: auth.currentUser.email || "",
    }));
  }, [selectedAnimal]);

  // CLOSE FORM WITH ESCAPE
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeApplication();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // PREVENT BACKGROUND SCROLL
  useEffect(() => {
    document.body.style.overflow = selectedAnimal ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedAnimal]);

  // SEARCH AND FILTER
  const filteredAnimals = listings.filter((animal) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      (animal.name || "").toLowerCase().includes(searchValue) ||
      (animal.animalType || "").toLowerCase().includes(searchValue) ||
      (animal.description || "").toLowerCase().includes(searchValue);

    const matchesType =
      animalType === "All" || animal.animalType === animalType;

    return matchesSearch && matchesType;
  });

  // OPEN APPLICATION
  const handleAnimalClick = (animal) => {
    if (!auth.currentUser) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/adoption",
            search: `?animalId=${encodeURIComponent(animal.id)}&apply=1`,
          },
        },
      });

      return;
    }

    setSelectedAnimal(animal);
    setSuccess("");
    setError("");
  };

  // CLOSE APPLICATION
  const closeApplication = () => {
    setSelectedAnimal(null);
    setSuccess("");
    setError("");

    if (searchParams.has("animalId")) {
      setSearchParams({}, { replace: true });
    }
  };

  // UPDATE FORM
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // SUBMIT APPLICATION AND NOTIFY ADMIN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/login", {
        state: {
          from: {
            pathname: "/adoption",
            search: `?animalId=${encodeURIComponent(selectedAnimal.id)}&apply=1`,
          },
        },
      });
      return;
    }

    if (!selectedAnimal) {
      setError("Please select an animal first.");
      return;
    }

    try {
      setSubmitting(true);

      // Create a batch for the application and notification
      const batch = writeBatch(db);

      // Generate document references
      const applicationRef = doc(
        collection(db, "adoptionApplications")
      );

      const notificationRef = doc(
        collection(db, "notifications")
      );

      // Save adoption application
      batch.set(applicationRef, {
        applicantUid: currentUser.uid,
        applicantName: form.fullName.trim(),
        email: currentUser.email,
        phone: form.phone.trim(),
        address: form.address.trim(),
        reason: form.reason.trim(),
        experience: form.experience,

        animalId: selectedAnimal.id,
        animalName: selectedAnimal.name || "Unnamed Animal",
        animalType: selectedAnimal.animalType || "Animal",
        animalPhoto: selectedAnimal.photoUrl || "",

        status: "Pending",
        createdAt: serverTimestamp(),
      });

      // Notify administrators
      batch.set(notificationRef, {
        recipientUid: "admins",
        actorUid: currentUser.uid,
        reportId: applicationRef.id,
        type: "adoption_submitted",
        title: "New Adoption Application",
        message: `${form.fullName.trim()} submitted an adoption application for ${
          selectedAnimal.name || "an animal"
        }.`,
        status: "Pending",
        read: false,
        createdAt: serverTimestamp(),
      });

      // Save both documents together
      await batch.commit();

      setSuccess(
        "Your adoption application has been submitted successfully! Our rescue team will review your application."
      );

      setForm({
        fullName: "",
        email: currentUser.email || "",
        phone: "",
        address: "",
        reason: "",
        experience: "",
      });
    } catch (err) {
      console.error("Adoption application error:", err);

      setError(
        "Unable to submit your application. Please try again. " +
        (err.message || "")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adoption-page">
      <Navbar />

      {/* HERO SECTION */}
      <section className="adoption-hero">
        <div>
          <span className="section-tag">FIND YOUR NEW BEST FRIEND</span>

          <h1>
            Give Them a Home.
            <br />
            <span>Give Them Love.</span>
          </h1>

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

      {/* AVAILABLE ANIMALS */}
      <section className="adoption-content">
        <div className="adoption-heading">
          <span className="section-tag">MEET YOUR COMPANION</span>
          <h2>Animals Looking for a Home</h2>
          <p>Browse our animals and find a friend to love.</p>
        </div>

        {/* SEARCH AND FILTER */}
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
            <option value="Other">Other Animals</option>
          </select>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="adoption-empty">
            <p>Loading animals...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && !selectedAnimal && (
          <div className="adoption-empty">
            <p>{error}</p>
          </div>
        )}

        {/* ANIMAL CARDS */}
        {!loading && !error && filteredAnimals.length > 0 && (
          <div className="adoption-animal-grid">
            {filteredAnimals.map((animal) => (
              <article className="adoption-animal-card" key={animal.id}>
                <button
                  type="button"
                  className="adoption-card-trigger"
                  onClick={() => handleAnimalClick(animal)}
                  aria-label={`Apply to adopt ${animal.name}`}
                >
                  <div className="adoption-animal-image">
                    {animal.photoUrl ? (
                      <img
                        src={animal.photoUrl}
                        alt={animal.name || "Animal available for adoption"}
                      />
                    ) : (
                      <div className="adoption-no-image">
                        <PawPrint size={45} />
                      </div>
                    )}

                    <span className="adoption-available-tag">
                      Available
                    </span>
                  </div>

                  <div className="adoption-animal-details">
                    <span className="adoption-animal-type">
                      {animal.animalType || "Animal"}
                    </span>

                    <h3>{animal.name || "Unnamed Animal"}</h3>

                    <div className="adoption-animal-meta">
                      <span>{animal.age || "Age unknown"}</span>
                      <span>{animal.gender || "Gender unknown"}</span>
                    </div>

                    <p className="adoption-animal-description">
                      {animal.description || "No description available."}
                    </p>

                    <span className="adoption-view-details">
                      Apply for Adoption <ArrowRight size={16} />
                    </span>
                  </div>
                </button>
              </article>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredAnimals.length === 0 && (
          <div className="adoption-empty">
            <div className="empty-icon">
              <Heart size={35} />
            </div>

            <h3>
              {listings.length === 0
                ? "No Adoption Listings Yet"
                : "No Matching Animals Found"}
            </h3>

            <p>
              {listings.length === 0
                ? "Animals available for adoption will appear here once they have been added by our rescue team."
                : "Try searching for another animal or changing the animal type filter."}
            </p>
          </div>
        )}
      </section>

      {/* ADOPTION APPLICATION FORM */}
      {selectedAnimal && (
        <div
          className="adoption-modal-overlay"
          onClick={closeApplication}
        >
          <div
            className="adoption-application-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="adoption-modal-close"
              onClick={closeApplication}
              aria-label="Close application"
            >
              <X size={22} />
            </button>

            {/* SELECTED ANIMAL */}
            <div className="application-animal-header">
              {selectedAnimal.photoUrl ? (
                <img
                  src={selectedAnimal.photoUrl}
                  alt={selectedAnimal.name}
                />
              ) : (
                <div className="application-animal-placeholder">
                  <PawPrint size={40} />
                </div>
              )}

              <div>
                <span className="section-tag">ADOPTION APPLICATION</span>
                <h2>{selectedAnimal.name || "Unnamed Animal"}</h2>

                <div className="application-animal-meta">
                  <span>
                    <PawPrint size={14} />
                    {selectedAnimal.animalType || "Animal"}
                  </span>

                  <span>
                    <CalendarDays size={14} />
                    {selectedAnimal.age || "Age unknown"}
                  </span>

                  <span>
                    {selectedAnimal.gender === "Female" ? (
                      <Venus size={14} />
                    ) : (
                      <Mars size={14} />
                    )}
                    {selectedAnimal.gender || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            <div className="application-form-content">
              {success ? (
                <div className="application-success">
                  <div className="application-success-icon">
                    <Heart size={35} />
                  </div>

                  <h2>Application Submitted!</h2>
                  <p>{success}</p>

                  <button
                    type="button"
                    className="application-submit"
                    onClick={closeApplication}
                  >
                    Back to Animals
                  </button>
                </div>
              ) : (
                <>
                  <div className="application-form-heading">
                    <h2 id="application-title">
                      Adoption Application Form
                    </h2>
                    <p>
                      Please provide your information so our rescue team
                      can review your adoption request.
                    </p>
                  </div>

                  {error && (
                    <div className="application-error" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="application-field">
                      <label htmlFor="fullName">Full Name *</label>
                      <div className="application-input">
                        <User size={18} />
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={form.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="application-field">
                      <label htmlFor="email">Account Email</label>
                      <div className="application-input application-readonly">
                        <Mail size={18} />
                        <input
                          id="email"
                          type="email"
                          value={auth.currentUser?.email || ""}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="application-field">
                      <label htmlFor="phone">Contact Number *</label>
                      <div className="application-input">
                        <Phone size={18} />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter your contact number"
                          value={form.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="application-field">
                      <label htmlFor="address">Complete Address *</label>
                      <div className="application-input">
                        <MapPin size={18} />
                        <input
                          id="address"
                          name="address"
                          type="text"
                          placeholder="Enter your complete address"
                          value={form.address}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="application-field">
                      <label htmlFor="reason">
                        Why do you want to adopt this animal? *
                      </label>
                      <div className="application-textarea">
                        <FileText size={18} />
                        <textarea
                          id="reason"
                          name="reason"
                          placeholder="Tell us why you want to adopt this animal..."
                          value={form.reason}
                          onChange={handleChange}
                          rows="4"
                          required
                        />
                      </div>
                    </div>

                    <div className="application-field">
                      <label htmlFor="experience">
                        Have you cared for a pet before? *
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select an answer</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <p className="application-note">
                      By submitting this form, you confirm that the
                      information provided is accurate and that your
                      application may be reviewed by the RESQPAWS rescue team.
                    </p>

                    <button
                      type="submit"
                      className="application-submit"
                      disabled={submitting}
                    >
                      {submitting
                        ? "Submitting Application..."
                        : "Submit Adoption Application"}

                      {!submitting && <ArrowRight size={18} />}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Adoption;
