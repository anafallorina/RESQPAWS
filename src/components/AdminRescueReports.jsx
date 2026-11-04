
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Search,
  MapPin,
  CalendarDays,
  Eye,
  Trash2,
  X,
  ClipboardList,
} from "lucide-react";

import { db } from "../firebase";
import "./AdminRescueReports.css";

const reportStatuses = [
  "Pending",
  "Under Review",
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

function AdminRescueReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState(null);

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

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const searchText = search.toLowerCase();

      const matchesSearch = [
        report.animalType,
        report.condition,
        report.description,
        report.address,
        report.locationDescription,
      ].some((value) =>
        String(value || "").toLowerCase().includes(searchText)
      );

      const matchesStatus =
        statusFilter === "All" || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, statusFilter]);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await updateDoc(doc(db, "rescueReports", reportId), {
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating report status:", error);
      alert("Unable to update report status. Please try again.");
    }
  };

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
      alert("Unable to delete report. Please try again.");
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
        <div className="reports-empty">
          Loading rescue reports...
        </div>
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
                <th>Location</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <strong>{report.animalType || "Unknown"}</strong>
                    <span className="report-description">
                      {report.description || "No description"}
                    </span>
                  </td>

                  <td>{report.condition || "Not specified"}</td>

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
                      className={`report-status-select ${report.status
                        ?.toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      value={report.status || "Pending"}
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
                  </td>

                  <td>
                    <div className="report-actions">
                      <button
                        type="button"
                        title="View report"
                        onClick={() => setSelectedReport(report)}
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
              ))}
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
                <span>Status</span>
                <strong>{selectedReport.status || "Pending"}</strong>
              </div>

              <div>
                <span>Date Submitted</span>
                <strong>{formatDate(selectedReport.createdAt)}</strong>
              </div>

              <div className="report-modal-full">
                <span>Description</span>
                <p>{selectedReport.description || "No description provided."}</p>
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
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminRescueReports;
