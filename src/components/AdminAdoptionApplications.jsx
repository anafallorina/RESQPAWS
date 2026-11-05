
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

import {
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  PawPrint,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
} from "lucide-react";

import { auth, db } from "../firebase";
import "./AdminAdoptionApplications.css";

function AdminAdoptionApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // LOAD ADOPTION APPLICATIONS
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "adoptionApplications"),
      (snapshot) => {
        const applicationList = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        applicationList.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        });

        setApplications(applicationList);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Error loading adoption applications:", err);
        setError(
          "Unable to load adoption applications. Please check your permissions."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // UPDATE APPLICATION STATUS AND NOTIFY APPLICANT
  const handleStatusUpdate = async (applicationId, newStatus) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this application as ${newStatus}?`
    );

    if (!confirmed) return;

    const application = applications.find(
      (item) => item.id === applicationId
    );

    if (!application) {
      alert("Application not found.");
      return;
    }

    if (!application.applicantUid) {
      alert("Applicant account information is missing.");
      return;
    }

    if (!auth.currentUser) {
      alert("Your admin session has expired. Please log in again.");
      return;
    }

    try {
      setUpdatingId(applicationId);

      const batch = writeBatch(db);

      const applicationRef = doc(
        db,
        "adoptionApplications",
        applicationId
      );

      const notificationRef = doc(collection(db, "notifications"));

      // Update the adoption application
      batch.update(applicationRef, {
        status: newStatus,
        reviewedAt: serverTimestamp(),
        statusUpdatedAt: serverTimestamp(),
      });

      // Create notification for the applicant
      batch.set(notificationRef, {
        recipientUid: application.applicantUid,
        actorUid: auth.currentUser.uid,
        reportId: applicationId,
        type: "adoption_status",
        title: "Adoption Application Update",
        message: `Your adoption application for ${
          application.animalName || "an animal"
        } has been ${newStatus.toLowerCase()}.`,
        status: newStatus,
        read: false,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      setSelectedApplication((previous) =>
        previous?.id === applicationId
          ? { ...previous, status: newStatus }
          : previous
      );
    } catch (err) {
      console.error("Error updating application:", err);

      alert(
        `Failed to update the application.\n${
          err.message || "Please try again."
        }`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // FORMAT DATE
  const formatDate = (timestamp) => {
    if (!timestamp) return "Not available";

    try {
      const date = timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);

      if (Number.isNaN(date.getTime())) return "Not available";

      return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Not available";
    }
  };

  // FILTER APPLICATIONS
  const filteredApplications = applications.filter((application) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (application.applicantName || "").toLowerCase().includes(search) ||
      (application.email || "").toLowerCase().includes(search) ||
      (application.animalName || "").toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      (application.status || "Pending") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "approved";
      case "Rejected":
        return "rejected";
      default:
        return "pending";
    }
  };

  const pendingCount = applications.filter(
    (application) => (application.status || "Pending") === "Pending"
  ).length;

  const approvedCount = applications.filter(
    (application) => application.status === "Approved"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  if (loading) {
    return (
      <div className="admin-applications-message">
        Loading adoption applications...
      </div>
    );
  }

  return (
    <div className="admin-applications">
      {/* SUMMARY */}
      <div className="application-summary-grid">
        <div className="application-summary-card">
          <div className="application-summary-icon pending-icon">
            <Clock />
          </div>
          <div>
            <p>Pending</p>
            <h3>{pendingCount}</h3>
          </div>
        </div>

        <div className="application-summary-card">
          <div className="application-summary-icon approved-icon">
            <CheckCircle />
          </div>
          <div>
            <p>Approved</p>
            <h3>{approvedCount}</h3>
          </div>
        </div>

        <div className="application-summary-card">
          <div className="application-summary-icon rejected-icon">
            <XCircle />
          </div>
          <div>
            <p>Rejected</p>
            <h3>{rejectedCount}</h3>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="application-toolbar">
        <div className="application-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search applicant or animal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Applications</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="application-error">
          {error}
        </div>
      )}

      {/* APPLICATION LIST */}
      {filteredApplications.length === 0 ? (
        <div className="application-empty">
          <PawPrint size={42} />
          <h3>No Applications Found</h3>
          <p>
            There are no adoption applications matching your search.
          </p>
        </div>
      ) : (
        <div className="application-table-wrapper">
          <table className="application-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Animal</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.map((application) => {
                const status = application.status || "Pending";

                return (
                  <tr key={application.id}>
                    <td>
                      <div className="application-applicant-cell">
                        <strong>
                          {application.applicantName || "Unknown Applicant"}
                        </strong>
                        <span>{application.email || "No email"}</span>
                      </div>
                    </td>

                    <td>
                      <div className="application-animal-cell">
                        {application.animalPhoto ? (
                          <img
                            src={application.animalPhoto}
                            alt={application.animalName || "Animal"}
                          />
                        ) : (
                          <div className="application-no-photo">
                            <PawPrint size={20} />
                          </div>
                        )}

                        <div>
                          <strong>
                            {application.animalName || "Unknown Animal"}
                          </strong>
                          <span>
                            {application.animalType || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{formatDate(application.createdAt)}</td>

                    <td>
                      <span
                        className={`application-status ${getStatusClass(status)}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="application-view-button"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* APPLICATION DETAILS MODAL */}
      {selectedApplication && (
        <div
          className="application-modal-overlay"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="application-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="application-modal-header">
              <div>
                <p>RESQPAWS ADMINISTRATION</p>
                <h2>Application Details</h2>
              </div>

              <button
                className="application-close-button"
                onClick={() => setSelectedApplication(null)}
              >
                <X />
              </button>
            </div>

            {/* ANIMAL INFORMATION */}
            <div className="application-detail-animal">
              {selectedApplication.animalPhoto ? (
                <img
                  src={selectedApplication.animalPhoto}
                  alt={selectedApplication.animalName || "Animal"}
                />
              ) : (
                <div className="application-detail-no-photo">
                  <PawPrint size={35} />
                </div>
              )}

              <div>
                <span>ANIMAL REQUESTED</span>
                <h3>
                  {selectedApplication.animalName || "Unknown Animal"}
                </h3>
                <p>{selectedApplication.animalType || "Not specified"}</p>
              </div>
            </div>

            {/* APPLICANT INFORMATION */}
            <div className="application-detail-section">
              <h3>Applicant Information</h3>

              <div className="application-detail-grid">
                <div className="application-detail-item">
                  <User />
                  <div>
                    <span>Full Name</span>
                    <strong>
                      {selectedApplication.applicantName || "Not provided"}
                    </strong>
                  </div>
                </div>

                <div className="application-detail-item">
                  <Mail />
                  <div>
                    <span>Email Address</span>
                    <strong>
                      {selectedApplication.email || "Not provided"}
                    </strong>
                  </div>
                </div>

                <div className="application-detail-item">
                  <Phone />
                  <div>
                    <span>Phone Number</span>
                    <strong>
                      {selectedApplication.phone || "Not provided"}
                    </strong>
                  </div>
                </div>

                <div className="application-detail-item">
                  <MapPin />
                  <div>
                    <span>Address</span>
                    <strong>
                      {selectedApplication.address || "Not provided"}
                    </strong>
                  </div>
                </div>

                <div className="application-detail-item">
                  <CalendarDays />
                  <div>
                    <span>Date Submitted</span>
                    <strong>
                      {formatDate(selectedApplication.createdAt)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ADOPTION INFORMATION */}
            <div className="application-detail-section">
              <h3>Adoption Information</h3>

              <div className="application-answer">
                <span>Reason for Adoption</span>
                <p>{selectedApplication.reason || "Not provided"}</p>
              </div>

              <div className="application-answer">
                <span>Previous Pet Ownership or Experience</span>
                <p>{selectedApplication.experience || "Not provided"}</p>
              </div>
            </div>

            {/* STATUS AND ACTIONS */}
            <div className="application-review-section">
              <div>
                <span>Current Application Status</span>
                <p>
                  <span
                    className={`application-status ${getStatusClass(
                      selectedApplication.status || "Pending"
                    )}`}
                  >
                    {selectedApplication.status || "Pending"}
                  </span>
                </p>
              </div>

              <div className="application-review-actions">
                <button
                  className="application-approve-button"
                  disabled={updatingId === selectedApplication.id}
                  onClick={() =>
                    handleStatusUpdate(selectedApplication.id, "Approved")
                  }
                >
                  <CheckCircle size={17} />
                  Approve
                </button>

                <button
                  className="application-reject-button"
                  disabled={updatingId === selectedApplication.id}
                  onClick={() =>
                    handleStatusUpdate(selectedApplication.id, "Rejected")
                  }
                >
                  <XCircle size={17} />
                  Reject
                </button>

                <button
                  className="application-pending-button"
                  disabled={updatingId === selectedApplication.id}
                  onClick={() =>
                    handleStatusUpdate(selectedApplication.id, "Pending")
                  }
                >
                  <Clock size={17} />
                  Set Pending
                </button>
              </div>

              {updatingId === selectedApplication.id && (
                <p className="application-updating-text">
                  Updating application...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAdoptionApplications;
