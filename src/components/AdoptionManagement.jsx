
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Heart,
} from "lucide-react";

import { db } from "../firebase";
import "./AdoptionManagement.css";

const CLOUDINARY_CLOUD_NAME = "sdxv2xdv";
const CLOUDINARY_UPLOAD_PRESET = "resqpaws_upload";

const initialForm = {
  name: "",
  animalType: "Dog",
  age: "",
  gender: "Unknown",
  description: "",
  status: "Available",
};

function AdoptionManagement() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState("");
  const [preview, setPreview] = useState("");

  const [error, setError] = useState("");

  // LOAD ADOPTION LISTINGS
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "adoptionListings"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        data.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        });

        setListings(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading adoption listings:", err);
        setError("Unable to load adoption listings.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // IMAGE PREVIEW
  useEffect(() => {
    if (!photo) {
      setPreview(currentPhotoUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(photo);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photo, currentPhotoUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setPhoto(null);
    setCurrentPhotoUrl("");
    setPreview("");
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (listing) => {
    setEditingId(listing.id);

    setForm({
      name: listing.name || "",
      animalType: listing.animalType || "Dog",
      age: listing.age || "",
      gender: listing.gender || "Unknown",
      description: listing.description || "",
      status: listing.status || "Available",
    });

    setCurrentPhotoUrl(listing.photoUrl || "");
    setPhoto(null);
    setShowForm(true);
    setError("");
  };

  // UPLOAD IMAGE TO CLOUDINARY
  const uploadPhoto = async () => {
    if (!photo) {
      return currentPhotoUrl;
    }

    const uploadData = new FormData();
    uploadData.append("file", photo);
    uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: uploadData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Cloudinary upload error:", result);
      throw new Error(
        result.error?.message || "Unable to upload the animal photo."
      );
    }

    return result.secure_url;
  };

  // ADD OR UPDATE LISTING
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.age.trim() || !form.description.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (!editingId && !photo) {
      setError("Please upload an animal photo.");
      return;
    }

    try {
      setSaving(true);

      const photoUrl = await uploadPhoto();

      if (!photoUrl) {
        throw new Error("Please upload an animal photo.");
      }

      const listingData = {
        name: form.name.trim(),
        animalType: form.animalType,
        age: form.age.trim(),
        gender: form.gender,
        description: form.description.trim(),
        photoUrl,
        status: form.status,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(
          doc(db, "adoptionListings", editingId),
          listingData
        );

        alert("Adoption listing updated successfully!");
      } else {
        await addDoc(collection(db, "adoptionListings"), {
          ...listingData,
          createdAt: serverTimestamp(),
        });

        alert("Animal added to adoption listings successfully!");
      }

      resetForm();

    } catch (err) {
      console.error("Error saving adoption listing:", err);
      setError(err.message || "Unable to save adoption listing.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE LISTING
  const handleDelete = async (listingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this adoption listing?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "adoptionListings", listingId));
      alert("Adoption listing deleted successfully!");
    } catch (err) {
      console.error("Error deleting adoption listing:", err);
      alert("Unable to delete this listing. Please try again.");
    }
  };

  return (
    <div className="adoption-management">

      <div className="adoption-management-top">
        <div>
          <h3>Animal Listings</h3>
          <p>Manage animals currently listed for adoption.</p>
        </div>

        <button
          className="adoption-add-btn"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Animal
        </button>
      </div>

      {error && !showForm && (
        <div className="adoption-admin-error">
          {error}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="adoption-form-card">
          <div className="adoption-form-heading">
            <div>
              <h3>
                {editingId ? "Edit Animal Listing" : "Add New Animal"}
              </h3>
              <p>Enter the animal's information below.</p>
            </div>

            <button
              type="button"
              className="adoption-close-btn"
              onClick={resetForm}
              disabled={saving}
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="adoption-form-grid">

              <div className="adoption-admin-field">
                <label htmlFor="animalName">Animal Name *</label>
                <input
                  id="animalName"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter animal name"
                  required
                />
              </div>

              <div className="adoption-admin-field">
                <label htmlFor="animalType">Animal Type *</label>
                <select
                  id="animalType"
                  name="animalType"
                  value={form.animalType}
                  onChange={handleChange}
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="adoption-admin-field">
                <label htmlFor="animalAge">Age *</label>
                <input
                  id="animalAge"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Example: 6 months old"
                  required
                />
              </div>

              <div className="adoption-admin-field">
                <label htmlFor="animalGender">Gender</label>
                <select
                  id="animalGender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="Unknown">Unknown</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="adoption-admin-field">
                <label htmlFor="animalStatus">Adoption Status</label>
                <select
                  id="animalStatus"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Available">Available</option>
                  <option value="Pending">Pending</option>
                  <option value="Adopted">Adopted</option>
                </select>
              </div>

              <div className="adoption-admin-field">
                <label htmlFor="animalPhoto">Animal Photo *</label>
                <input
                  id="animalPhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setPhoto(e.target.files?.[0] || null);
                  }}
                />
                <small>
                  {editingId
                    ? "Leave empty to keep the current photo."
                    : "Choose a photo of the animal."}
                </small>
              </div>

              <div className="adoption-admin-field adoption-description-field">
                <label htmlFor="animalDescription">Description *</label>
                <textarea
                  id="animalDescription"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the animal's personality, condition, and other details..."
                  rows={4}
                  required
                />
              </div>

            </div>

            {preview && (
              <div className="adoption-photo-preview">
                <img src={preview} alt="Animal preview" />
              </div>
            )}

            {error && (
              <div className="adoption-admin-error" role="alert">
                {error}
              </div>
            )}

            <div className="adoption-form-actions">
              <button
                type="button"
                className="adoption-cancel-btn"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="adoption-save-btn"
                disabled={saving}
              >
                <Upload size={17} />
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Listing"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTINGS */}
      {loading ? (
        <div className="adoption-admin-empty">
          Loading adoption listings...
        </div>
      ) : listings.length === 0 ? (
        <div className="adoption-admin-empty">
          <Heart size={35} />
          <h3>No Adoption Listings Yet</h3>
          <p>Click "Add Animal" to create your first listing.</p>
        </div>
      ) : (
        <div className="adoption-admin-list">
          {listings.map((listing) => (
            <div className="adoption-admin-item" key={listing.id}>
              <img
                src={listing.photoUrl || ""}
                alt={listing.name || "Animal"}
              />

              <div className="adoption-admin-item-info">
                <h4>{listing.name}</h4>

                <p>
                  {listing.animalType || "Animal"} · {listing.age || "Age unknown"} · {listing.gender || "Unknown"}
                </p>

                <span
                  className={`adoption-status status-${(listing.status || "Available").toLowerCase()}`}
                >
                  {listing.status || "Available"}
                </span>
              </div>

              <div className="adoption-admin-item-actions">
                <button
                  type="button"
                  onClick={() => openEditForm(listing)}
                  aria-label={`Edit ${listing.name}`}
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(listing.id)}
                  aria-label={`Delete ${listing.name}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdoptionManagement;
