
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import {
  Search,
  MapPin,
  CalendarDays,
  Eye,
  Trash2,
  X,
  ClipboardList,
  UserCheck,
} from "lucide-react";

import { auth, db } from "../firebase";
import "./AdminRescueReports.css";

const reportStatuses = [
  "Pending",
  "Under Review",
  "Verified",
  "Assigned",
  "In Progress",
  "Resolved",
];

function formatDate(timestamp) {
  if (!timestamp) return "Date unavailable";

  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getUrgencyLevel(report) {
  if (report.urgency) return report.urgency;

  switch (report.condition) {
    case "In Danger":
      return "Critical";
    case "Injured":
    case "Sick":
      return "High";
    case "Abandoned":
    case "Stray":
      return "Medium";
    case "Other":
    default:
      return "Needs Assessment";
  }
}

function getUrgencyStyle(urgency) {
  const styles = {
    Critical: {
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
    },
    High: {
      backgroundColor: "#ffedd5",
      color: "#c2410c",
    },
    Medium: {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    },
    "Needs Assessment": {
      backgroundColor: "#e5e7eb",
      color: "#374151",
    },
  };

  return styles[urgency] || styles["Needs Assessment"];
}

function getRescuerName(user) {
  return (
    user.fullName ||
    user.name ||
    user.displayName ||
    user.email ||
    "Unnamed Rescuer"
  );
}

function AdminRescueReports() {
  const [reports, setReports] = useState([]);
  const [rescuers, setRescuers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingRescuers, setLoadingRescuers] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedRescuerUid, setSelectedRescuerUid] = useState("");

  const [updatingReportId, setUpdatingReportId] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [rescuerError, setRescuerError] = useState("");

  // FETCH RESCUE REPORTS
  useEffect(() => {
    const reportsQuery = query(
      collection(db, "rescueReports"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const reportList = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setReports(reportList);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading rescue reports:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // FETCH REGISTERED RESCUERS
  useEffect(() => {
    const rescuersQuery = query(
      collection(db, "users"),
      where("role", "==", "rescuer")
    );

    const unsubscribe = onSnapshot(
      rescuersQuery,
      (snapshot) => {
        const rescuerList = snapshot.docs.map((item) => ({
          uid: item.id,
          ...item.data(),
        }));

        setRescuers(rescuerList);
        setLoadingRescuers(false);
        setRescuerError("");
      },
      (error) => {
        console.error("Error loading rescuers:", error);
        setRescuerError(
          "Unable to load rescuers. Check your Firestore Security Rules."
        );
        setLoadingRescuers(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // KEEP SELECTED REPORT UPDATED
  useEffect(() => {
    if (!selectedReport) return;

    const updatedReport = reports.find(
      (report) => report.id === selectedReport.id
    );

    if (updatedReport) {
      setSelectedReport(updatedReport);
    }
  }, [reports]);

  // SEARCH AND FILTER REPORTS
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        report.animalType,
        report.condition,
        report.urgency || getUrgencyLevel(report),
        report.description,
        report.address,
        report.locationDescription,
        report.assignedRescuerName,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      );

      const matchesStatus =
        statusFilter === "All" || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  // UPDATE REPORT STATUS
  const handleStatusChange = async (reportId, newStatus) => {
    if (newStatus === "Assigned") {
      alert("Please use the Assign Rescuer option to assign this report.");
      return;
    }

    try {
      setUpdatingReportId(reportId);

      await updateDoc(doc(db, "rescueReports", reportId), {
        status: newStatus,
      });

      console.log("Report status updated successfully:", newStatus);
    } catch (error) {
      console.error("Firebase update error:", {
        code: error.code,
        message: error.message,
      });

      alert(
        `Unable to update report status.\n\nError: ${
          error.code || "Unknown error"
        }\n${error.message || "Please check your Firebase configuration."}`
      );
    } finally {
      setUpdatingReportId(null);
    }
  };

  // OPEN REPORT DETAILS
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setSelectedRescuerUid(report.assignedRescuerUid || "");
  };

  // ASSIGN RESCUER AND CREATE NOTIFICATION
  const handleAssignRescuer = async () => {
    if (!selectedReport) return;

    if (
      selectedReport.status !== "Verified" &&
      selectedReport.status !== "Assigned"
    ) {
      alert("Please verify the rescue report before assigning a rescuer.");
      return;
    }

    if (!selectedRescuerUid) {
      alert("Please select a rescuer first.");
      return;
    }

    const selectedRescuer = rescuers.find(
      (rescuer) => rescuer.uid === selectedRescuerUid
    );

    if (!selectedRescuer) {
      alert("The selected rescuer could not be found.");
      return;
    }

    if (!auth.currentUser) {
      alert("Your admin session has expired. Please log in again.");
      return;
    }

    try {
      setAssigning(true);

      const batch = writeBatch(db);

      const reportRef = doc(
        db,
        "rescueReports",
        selectedReport.id
      );

      const notificationRef = doc(collection(db, "notifications"));

      const rescuerName = getRescuerName(selectedRescuer);

      // Update the rescue report
      batch.update(reportRef, {
        assignedRescuerUid: selectedRescuer.uid,
        assignedRescuerName: rescuerName,
        assignedAt: serverTimestamp(),
        status: "Assigned",
      });

      // Create notification for the assigned rescuer
      batch.set(notificationRef, {
        recipientUid: selectedRescuer.uid,
        actorUid: auth.currentUser.uid,
        reportId: selectedReport.id,
        type: "rescue_assigned",
        title: "New Rescue Assignment",
        message: `You have been assigned to a ${
          selectedReport.animalType || "animal"
        } rescue case.`,
        status: "Assigned",
        read: false,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      alert("Rescuer assigned successfully!");
    } catch (error) {
      console.error("Error assigning rescuer:", error);

      alert(
        `Unable to assign rescuer.\n\nError: ${
          error.code || "Unknown error"
        }\n${error.message || ""}`
      );
    } finally {
      setAssigning(false);
    }
  };

  // DELETE REPORT
  const handleDelete = async (report) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this rescue report?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "rescueReports", report.id));

      if (selectedReport?.id === report.id) {
        setSelectedReport(null);
      }

      alert("Rescue report deleted successfully.");
    } catch (error) {
      console.error("Error deleting report:", error);

      alert(
        `Unable to delete report.\n\nError: ${
          error.code || "Unknown error"
        }\n${error.message || ""}`
      );
    }
  };

  return (
    <section className="admin-reports">
      {/* SEARCH AND FILTER */}
      <div className="reports-toolbar">
        <div className="reports-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search animal, description, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="reports-status-filter"
        >
          <option value="All">All Statuses</option>

          {reportStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* REPORT COUNT */}
      <div className="reports-count">
        <ClipboardList size={19} />

        <span>
          Showing <strong>{filteredReports.length}</strong> of{" "}
          <strong>{reports.length}</strong> reports
        </span>
      </div>

      {/* REPORT LIST */}
      {loading ? (
        <div className="reports-empty">Loading rescue reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="reports-empty">
          <ClipboardList size={42} />
          <h3>No Rescue Reports Found</h3>
          <p>
            {reports.length === 0
              ? "Submitted animal reports will appear here."
              : "Try changing your search or status filter."}
          </p>
        </div>
      ) : (
        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Animal</th>
                <th>Condition</th>
                <th>Urgency</th>
                <th>Location</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map((report) => {
                const urgency = getUrgencyLevel(report);

                return (
                  <tr key={report.id}>
                    <td>
                      <strong>{report.animalType || "Unknown"}</strong>

                      <span className="report-description">
                        {report.description || "No description"}
                      </span>
                    </td>

                    <td>{report.condition || "Not specified"}</td>

                    <td>
                      <span
                        style={{
                          ...getUrgencyStyle(urgency),
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {urgency}
                      </span>
                    </td>

                    <td>
                      <span className="report-location">
                        <MapPin size={14} />
                        {report.locationDescription ||
                          report.address ||
                          "No location details"}
                      </span>
                    </td>

                    <td>
                      <span className="report-date">
                        <CalendarDays size={14} />
                        {formatDate(report.createdAt)}
                      </span>
                    </td>

                    <td>
                      <select
                        className={`report-status-select ${
                          (report.status || "Pending")
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                        }`}
                        value={report.status || "Pending"}
                        disabled={updatingReportId === report.id}
                        onChange={(e) =>
                          handleStatusChange(report.id, e.target.value)
                        }
                      >
                        {reportStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {updatingReportId === report.id && (
                        <small>Updating...</small>
                      )}

                      {report.assignedRescuerName && (
                        <small className="report-description">
                          Rescuer: {report.assignedRescuerName}
                        </small>
                      )}
                    </td>

                    <td>
                      <div className="report-actions">
                        <button
                          type="button"
                          title="View report"
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          title="Delete report"
                          className="report-delete-btn"
                          onClick={() => handleDelete(report)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT DETAILS MODAL */}
      {selectedReport && (
        <div
          className="report-modal-overlay"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="report-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="report-modal-header">
              <div>
                <span>RESCUE REPORT DETAILS</span>
                <h2>{selectedReport.animalType || "Animal Report"}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                aria-label="Close report details"
              >
                <X />
              </button>
            </div>

            {/* ANIMAL PHOTO */}
            {selectedReport.photoUrl ? (
              <img
                className="report-modal-image"
                src={selectedReport.photoUrl}
                alt="Reported animal"
              />
            ) : (
              <div className="report-no-image">
                No animal photo available
              </div>
            )}

            {/* REPORT DETAILS */}
            <div className="report-modal-details">
              <div>
                <span>Animal Type</span>
                <strong>{selectedReport.animalType || "N/A"}</strong>
              </div>

              <div>
                <span>Condition</span>
                <strong>{selectedReport.condition || "N/A"}</strong>
              </div>

              <div>
                <span>Urgency Level</span>
                <strong
                  style={{
                    ...getUrgencyStyle(getUrgencyLevel(selectedReport)),
                    display: "inline-block",
                    width: "fit-content",
                    padding: "5px 10px",
                    borderRadius: "20px",
                    fontSize: "13px",
                  }}
                >
                  {getUrgencyLevel(selectedReport)}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{selectedReport.status || "Pending"}</strong>
              </div>

              <div>
                <span>Date Submitted</span>
                <strong>{formatDate(selectedReport.createdAt)}</strong>
              </div>

              <div className="report-modal-full">
                <span>Description</span>
                <p>
                  {selectedReport.description || "No description provided."}
                </p>
              </div>

              <div className="report-modal-full">
                <span>Address</span>
                <p>{selectedReport.address || "No address available."}</p>
              </div>

              <div className="report-modal-full">
                <span>Additional Location Details</span>
                <p>
                  {selectedReport.locationDescription ||
                    "No additional details."}
                </p>
              </div>

              {selectedReport.location && (
                <div className="report-modal-full">
                  <span>Coordinates</span>
                  <p>
                    {selectedReport.location.latitude},{" "}
                    {selectedReport.location.longitude}
                  </p>
                </div>
              )}

              {/* RESCUE ASSIGNMENT */}
              <div className="report-modal-full rescue-assignment-section">
                <span>
                  <UserCheck
                    size={16}
                    style={{
                      verticalAlign: "middle",
                      marginRight: "6px",
                    }}
                  />
                  Rescue Assignment
                </span>

                {selectedReport.status === "Verified" ||
                selectedReport.status === "Assigned" ? (
                  <>
                    {loadingRescuers ? (
                      <p>Loading registered rescuers...</p>
                    ) : rescuers.length === 0 ? (
                      <p>
                        No registered rescuers found. Assign the rescuer role
                        to an existing user first.
                      </p>
                    ) : (
                      <>
                        <select
                          value={selectedRescuerUid}
                          onChange={(e) =>
                            setSelectedRescuerUid(e.target.value)
                          }
                          disabled={assigning}
                        >
                          <option value="">Select a rescuer</option>

                          {rescuers.map((rescuer) => (
                            <option key={rescuer.uid} value={rescuer.uid}>
                              {getRescuerName(rescuer)}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="rescue-assign-button"
                          onClick={handleAssignRescuer}
                          disabled={assigning || !selectedRescuerUid}
                        >
                          {assigning
                            ? "Assigning..."
                            : selectedReport.status === "Assigned"
                            ? "Reassign Rescuer"
                            : "Assign Rescuer"}
                        </button>
                      </>
                    )}

                    {rescuerError && (
                      <p role="alert">{rescuerError}</p>
                    )}
                  </>
                ) : (
                  <p>
                    Change the report status to Verified before assigning a
                    rescuer.
                  </p>
                )}

                {selectedReport.assignedRescuerName && (
                  <p>
                    <strong>Currently assigned to:</strong>{" "}
                    {selectedReport.assignedRescuerName}
                  </p>
                )}

                {selectedReport.assignedAt && (
                  <p>
                    <strong>Assigned on:</strong>{" "}
                    {formatDate(selectedReport.assignedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminRescueReports;
