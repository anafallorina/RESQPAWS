
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Upload,
  X,
  LocateFixed,
  Camera,
  AlertCircle,
  ChevronDown,
  Check,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "leaflet/dist/leaflet.css";
import "./ReportAnimal.css";

const philippinesCenter = [12.8797, 121.774];

const animalMarker = L.divIcon({
  className: "animal-map-marker",
  html: '<div class="marker-pin"><span></span></div>',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

// MAP CLICK HANDLER
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

// CUSTOM DROPDOWN COMPONENT
function CustomDropdown({
  id,
  value,
  placeholder,
  options,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button
        type="button"
        id={id}
        className={`custom-dropdown-trigger ${
          isOpen ? "dropdown-open" : ""
        }`}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={
            selectedOption ? "selected-value" : "placeholder-value"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`dropdown-arrow ${
            isOpen ? "arrow-rotated" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu" role="listbox">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`custom-dropdown-option ${
                value === option.value ? "option-selected" : ""
              }`}
              onClick={() => handleSelect(option.value)}
              role="option"
              aria-selected={value === option.value}
            >
              <span>{option.label}</span>

              {value === option.value && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportAnimal() {
  const [form, setForm] = useState({
    animalType: "",
    condition: "",
    description: "",
    locationDescription: "",
  });

  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  // UPDATE FORM FIELDS
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // AUTOMATIC ADDRESS DETECTION
  useEffect(() => {
    if (!location) {
      setResolvedAddress("");
      return;
    }

    let cancelled = false;

    const getAddress = async () => {
      setAddressLoading(true);
      setResolvedAddress("");

      try {
        const [latitude, longitude] = location;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );

        if (!response.ok) {
          throw new Error("Address lookup failed");
        }

        const data = await response.json();

        if (!cancelled) {
          setResolvedAddress(
            data.display_name ||
              "Address not available for this location."
          );
        }
      } catch (error) {
        if (!cancelled) {
          setResolvedAddress(
            "Unable to retrieve the address. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setAddressLoading(false);
        }
      }
    };

    getAddress();

    return () => {
      cancelled = true;
    };
  }, [location]);

  // CLEAN UP PHOTO PREVIEW URL
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // HANDLE PHOTO UPLOAD
  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // REMOVE UPLOADED PHOTO
  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview("");
  };

  // GET USER'S CURRENT LOCATION
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);

        setLocationLoading(false);
      },
      () => {
        alert(
          "Unable to get your location. Please allow location access or select a point on the map."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  // SUBMIT REPORT
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.animalType || !form.condition) {
      alert("Please select the animal type and current condition.");
      return;
    }

    if (!location) {
      alert("Please select the animal's location on the map.");
      return;
    }

    if (addressLoading) {
      alert("Please wait while the address is being detected.");
      return;
    }

    const reportDetails = {
      ...form,
      address: resolvedAddress,
      location: {
        latitude: location[0],
        longitude: location[1],
      },
      photo,
    };

    // FIREBASE SUBMISSION WILL BE CONNECTED LATER
    console.log("Report details:", reportDetails);

    alert(
      "Your report form is ready. Firebase submission will be connected next."
    );
  };

  return (
    <>
      <Navbar />

      <main className="report-page">
        <section className="report-heading">
          <span className="report-eyebrow">
            HELP AN ANIMAL IN NEED
          </span>

          <h1>Report an Animal</h1>

          <p>
            Found an animal that needs help? Share the details so
            the rescue team can locate and assist them.
          </p>
        </section>

        <form className="report-form" onSubmit={handleSubmit}>
          {/* ANIMAL INFORMATION */}
          <div className="report-section">
            <div className="section-heading">
              <span className="section-number">01</span>

              <div>
                <h2>Animal Information</h2>
                <p>Tell us about the animal you found.</p>
              </div>
            </div>

            <div className="form-grid">
              {/* ANIMAL TYPE */}
              <div className="form-field">
                <label htmlFor="animalType">
                  Animal Type <span>*</span>
                </label>

                <CustomDropdown
                  id="animalType"
                  value={form.animalType}
                  placeholder="Select animal type"
                  onChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      animalType: value,
                    }))
                  }
                  options={[
                    { value: "Dog", label: "Dog" },
                    { value: "Cat", label: "Cat" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              </div>

              {/* CURRENT CONDITION */}
              <div className="form-field">
                <label htmlFor="condition">
                  Current Condition <span>*</span>
                </label>

                <CustomDropdown
                  id="condition"
                  value={form.condition}
                  placeholder="Select condition"
                  onChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      condition: value,
                    }))
                  }
                  options={[
                    { value: "Injured", label: "Injured" },
                    { value: "Sick", label: "Sick" },
                    { value: "Stray", label: "Stray" },
                    { value: "Abandoned", label: "Abandoned" },
                    { value: "In Danger", label: "In Danger" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="form-field">
              <label htmlFor="description">
                Description <span>*</span>
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the animal's appearance, condition, and situation..."
                rows="5"
                required
              />
            </div>
          </div>

          <div className="report-divider" />

          {/* ANIMAL PHOTO */}
          <div className="report-section">
            <div className="section-heading">
              <span className="section-number">02</span>

              <div>
                <h2>Animal Photo</h2>
                <p>Upload a photo to help identify the animal.</p>
              </div>
            </div>

            {photoPreview ? (
              <div className="photo-preview">
                <img src={photoPreview} alt="Animal preview" />

                <div className="photo-details">
                  <span>{photo?.name}</span>

                  <small>
                    {(photo.size / 1024 / 1024).toFixed(2)} MB
                  </small>
                </div>

                <button
                  type="button"
                  className="remove-photo"
                  onClick={removePhoto}
                  aria-label="Remove photo"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label className="upload-area" htmlFor="animalPhoto">
                <span className="upload-icon">
                  <Camera size={25} />
                </span>

                <strong>Upload an animal photo</strong>
                <span>Click to browse your files</span>
                <small>JPG, PNG or WEBP · Maximum 5 MB</small>

                <input
                  id="animalPhoto"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            )}
          </div>

          <div className="report-divider" />

          {/* ANIMAL LOCATION */}
          <div className="report-section">
            <div className="section-heading">
              <span className="section-number">03</span>

              <div>
                <h2>Animal Location</h2>
                <p>Pin the location where the animal was found.</p>
              </div>
            </div>

            <div className="location-instructions">
              <MapPin size={18} />

              <span>
                Click anywhere on the map to place a location pin.
              </span>
            </div>

            <div className="map-container">
              <MapContainer
                center={philippinesCenter}
                zoom={6}
                scrollWheelZoom={true}
                className="report-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler onLocationSelect={setLocation} />

                {location && (
                  <Marker position={location} icon={animalMarker} />
                )}
              </MapContainer>
            </div>

            <button
              type="button"
              className="current-location-btn"
              onClick={getCurrentLocation}
              disabled={locationLoading}
            >
              <LocateFixed size={17} />

              {locationLoading
                ? "Getting location..."
                : "Use My Current Location"}
            </button>

            {/* DETECTED ADDRESS */}
            {location && (
              <div className="selected-location">
                <MapPin size={19} />

                <div className="selected-location-info">
                  <strong>
                    {addressLoading
                      ? "Finding address..."
                      : "Detected Address"}
                  </strong>

                  <p>
                    {addressLoading
                      ? "Please wait while we identify the location."
                      : resolvedAddress || "Address not available."}
                  </p>

                  <small>
                    Coordinates: {location[0].toFixed(6)},{" "}
                    {location[1].toFixed(6)}
                  </small>
                </div>
              </div>
            )}

            {/* ADDITIONAL LOCATION DETAILS */}
            <div className="form-field location-description-field">
              <label htmlFor="locationDescription">
                Additional Location Details
              </label>

              <input
                id="locationDescription"
                name="locationDescription"
                type="text"
                value={form.locationDescription}
                onChange={handleChange}
                placeholder="Street, barangay, landmark, or nearby establishment"
              />
            </div>
          </div>

          {/* NOTICE */}
          <div className="report-notice">
            <AlertCircle size={19} />

            <p>
              Please provide accurate information. If the animal is in
              immediate danger, contact your local animal rescue authorities.
            </p>
          </div>

          {/* SUBMIT */}
          <div className="report-submit">
            <p>
              <span>*</span> Required fields
            </p>

            <button type="submit" className="submit-report-btn">
              Submit Animal Report
              <Upload size={17} />
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </>
  );
}

export default ReportAnimal;
