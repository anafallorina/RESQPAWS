
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  PawPrint,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserRound,
  Bell,
  Volume2,
  VolumeX,
} from "lucide-react";

import { auth, db } from "../firebase";
import "./RescuerDashboard.css";

import NotificationPanel from "../components/NotificationPanel";
import { playNotificationSound } from "../utils/notifications";

const statusOptions = {
  Assigned: ["In Progress"],
  "In Progress": ["Rescued"],
  Rescued: ["Closed"],
  Closed: [],
};

function RescuerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescuerName, setRescuerName] = useState("Rescuer");
  const [userEmail, setUserEmail] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // NOTIFICATION STATES
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const firstNotificationSnapshot = useRef(true);
  const alarmInterval = useRef(null);

  // =====================================
  // LISTEN TO AUTHENTICATED RESCUER,
  // ASSIGNED CASES, AND NOTIFICATIONS
  // =====================================
  useEffect(() => {
    let unsubscribeReports = () => {};
    let unsubscribeNotifications = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeReports();
      unsubscribeNotifications();

      firstNotificationSnapshot.current = true;

      if (!user) {
        setReports([]);
        setNotifications([]);
        setLoading(false);
        setRescuerName("Rescuer");
        setUserEmail("");
        return;
      }

      setLoading(true);
      setUserEmail(user.email || "");

      // LISTEN TO ASSIGNED RESCUE CASES
      const reportsQuery = query(
        collection(db, "rescueReports"),
        where("assignedRescuerUid", "==", user.uid)
      );

      unsubscribeReports = onSnapshot(
        reportsQuery,
        (snapshot) => {
          const assignedReports = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }));

          assignedReports.sort((a, b) => {
            const dateA =
              a.assignedAt?.toDate?.()?.getTime() || 0;
            const dateB =
              b.assignedAt?.toDate?.()?.getTime() || 0;

            return dateB - dateA;
          });

          setReports(assignedReports);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching assigned reports:", error);
          setLoading(false);
        }
      );

      // LISTEN TO RESCUER NOTIFICATIONS
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("recipientUid", "==", user.uid)
      );

      unsubscribeNotifications = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          const notificationList = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }));

          notificationList.sort((a, b) => {
            const dateA =
              a.createdAt?.toDate?.()?.getTime() || 0;
            const dateB =
              b.createdAt?.toDate?.()?.getTime() || 0;

            return dateB - dateA;
          });

          // Do not alarm for existing notifications on initial load.
          if (firstNotificationSnapshot.current) {
            firstNotificationSnapshot.current = false;
          } else {
            const newUnreadNotifications = snapshot
              .docChanges()
              .filter(
                (change) =>
                  change.type === "added" &&
                  change.doc.data().read === false
              );

            if (newUnreadNotifications.length > 0) {
              setNotificationOpen(true);
            }
          }

          setNotifications(notificationList);
        },
        (error) => {
          console.error("Rescuer notification listener error:", error);
        }
      );

      // GET RESCUER PROFILE
      const getRescuerProfile = async () => {
        try {
          const userSnapshot = await getDoc(
            doc(db, "users", user.uid)
          );

          if (userSnapshot.exists()) {
            const data = userSnapshot.data();

            setRescuerName(
              data.fullName ||
              data.name ||
              data.displayName ||
              user.email ||
              "Rescuer"
            );
          }
        } catch (error) {
          console.error("Error fetching rescuer profile:", error);
        }
      };

      getRescuerProfile();
    });

    return () => {
      unsubscribeAuth();
      unsubscribeReports();
      unsubscribeNotifications();
    };
  }, []);

  // =====================================
  // COUNT UNREAD NOTIFICATIONS
  // =====================================
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // =====================================
  // REPEAT ALARM EVERY 5 SECONDS
  // WHILE UNREAD NOTIFICATIONS EXIST
  // =====================================
  useEffect(() => {
    if (soundEnabled && unreadCount > 0) {
      if (!alarmInterval.current) {
        playNotificationSound();

        alarmInterval.current = setInterval(() => {
          playNotificationSound();
        }, 5000);
      }
    } else {
      if (alarmInterval.current) {
        clearInterval(alarmInterval.current);
        alarmInterval.current = null;
      }
    }

    return () => {
      if (alarmInterval.current) {
        clearInterval(alarmInterval.current);
        alarmInterval.current = null;
      }
    };
  }, [soundEnabled, unreadCount]);

  // =====================================
  // MARK NOTIFICATION AS READ
  // =====================================
  const handleMarkRead = async (notificationId) => {
    try {
      await updateDoc(
        doc(db, "notifications", notificationId),
        { read: true }
      );
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
      alert("Unable to update notification. Please try again.");
    }
  };

  // =====================================
  // SOUND BUTTON
  // =====================================
  const handleSoundToggle = () => {
    if (!soundEnabled) {
      playNotificationSound();
      setSoundEnabled(true);
    } else {
      setSoundEnabled(false);
    }
  };

  // =====================================
  // UPDATE RESCUE STATUS AND NOTIFY REPORTER
  // =====================================
  const handleStatusUpdate = async (report) => {
    const currentStatus = report.status || "Assigned";
    const nextStatus = statusOptions[currentStatus]?.[0];

    if (!nextStatus) return;

    const confirmed = window.confirm(
      `Update this rescue case from "${currentStatus}" to "${nextStatus}"?`
    );

    if (!confirmed) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Your session has expired. Please log in again.");
      return;
    }

    if (!report.reporterUid) {
      alert(
        "The report does not contain the reporter's account information. The status cannot be updated with a notification."
      );
      return;
    }

    try {
      setUpdatingId(report.id);

      const batch = writeBatch(db);

      const reportRef = doc(db, "rescueReports", report.id);
      const notificationRef = doc(collection(db, "notifications"));

      // UPDATE RESCUE REPORT
      batch.update(reportRef, {
        status: nextStatus,
        statusUpdatedAt: serverTimestamp(),
      });

      // NOTIFY THE PERSON WHO SUBMITTED THE REPORT
      batch.set(notificationRef, {
        recipientUid: report.reporterUid,
        actorUid: currentUser.uid,
        reportId: report.id,
        type: "rescue_status",
        title: "Rescue Report Update",
        message: `The status of your ${report.animalType || "animal"} rescue report has been updated to ${nextStatus}.`,
        status: nextStatus,
        read: false,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      alert(`Rescue status updated to ${nextStatus}!`);
    } catch (error) {
      console.error("Error updating rescue status:", error);

      alert(
        `Unable to update the rescue status.\n\n${
          error.code || "Error"
        }: ${error.message || "Please try again."}`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================
  // LOGOUT
  // =====================================
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to log out. Please try again.");
    }
  };

  // =====================================
  // STATUS STYLE
  // =====================================
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "assigned":
        return "assigned";
      case "in progress":
        return "in-progress";
      case "rescued":
        return "rescued";
      case "closed":
        return "closed";
      default:
        return "assigned";
    }
  };

  const getNextStatus = (status) => {
    return statusOptions[status || "Assigned"]?.[0] || null;
  };

  // =====================================
  // FORMAT DATE
  // =====================================
  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Date unavailable";

    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =====================================
  // DASHBOARD COUNTS
  // =====================================
  const activeCases = reports.filter(
    (report) =>
      !["Rescued", "Closed"].includes(report.status)
  ).length;

  const rescuedCases = reports.filter(
    (report) =>
      ["Rescued", "Closed"].includes(report.status)
  ).length;

  // =====================================
  // GET ANIMAL IMAGE
  // =====================================
  const getAnimalImage = (report) => {
    return (
      report.imageUrl ||
      report.imageURL ||
      report.photoURL ||
      report.image ||
      report.animalImage ||
      ""
    );
  };

  return (
    <div className="rescuer-dashboard">

      {/* SIDEBAR */}
      <aside className="rescuer-sidebar">
        <Link to="/" className="rescuer-logo">
          <PawPrint size={27} />
          <span>
            RESQ<span>PAWS</span>
          </span>
        </Link>

        <p className="rescuer-sidebar-label">RESCUER MENU</p>

        <nav className="rescuer-sidebar-nav">
          <Link to="/rescuer" className="rescuer-sidebar-link active">
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <a
            href="#assigned-cases"
            className="rescuer-sidebar-link"
          >
            <ClipboardList size={19} />
            Assigned Cases
          </a>
        </nav>

        <div className="rescuer-sidebar-bottom">
          <button
            type="button"
            className="rescuer-sidebar-link rescuer-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="rescuer-main">

        {/* HEADER */}
        <header className="rescuer-header">
          <div>
            <h2>Rescuer Dashboard</h2>
            <p>Manage your assigned animal rescue cases.</p>
          </div>

          <div
            className="rescuer-user"
            style={{ gap: "14px" }}
          >
            {/* SOUND CONTROL */}
            <button
              type="button"
              onClick={handleSoundToggle}
              title={soundEnabled ? "Disable sound" : "Enable sound"}
              aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
              style={{
                position: "relative",
                border: "none",
                background: "#f3f4f6",
                borderRadius: "50%",
                width: "42px",
                height: "42px",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                color: "#333",
                flexShrink: 0,
              }}
            >
              {soundEnabled ? (
                <Volume2 size={20} />
              ) : (
                <VolumeX size={20} />
              )}
            </button>

            {/* NOTIFICATION BUTTON */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                type="button"
                onClick={() =>
                  setNotificationOpen((previous) => !previous)
                }
                title="Notifications"
                aria-label={`Notifications: ${unreadCount} unread`}
                style={{
                  position: "relative",
                  border: "none",
                  background: "#f3f4f6",
                  borderRadius: "50%",
                  width: "42px",
                  height: "42px",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  color: "#333",
                }}
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "#e53935",
                      color: "#fff",
                      borderRadius: "50%",
                      minWidth: "19px",
                      height: "19px",
                      padding: "0 4px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <NotificationPanel
                  notifications={notifications}
                  onMarkRead={handleMarkRead}
                  onClose={() => setNotificationOpen(false)}
                />
              )}
            </div>

            {/* RESCUER PROFILE */}
            <div className="rescuer-avatar">
              <UserRound size={21} />
            </div>

            <div>
              <strong>{rescuerName}</strong>
              <small title={userEmail}>{userEmail}</small>
            </div>
          </div>
        </header>

        {/* WELCOME BANNER */}
        <section className="rescuer-welcome">
          <div>
            <span>RESQPAWS RESCUE TEAM</span>

            <h1>
              Every rescue
              <br />
              makes a difference.
            </h1>

            <p>
              View your assigned cases and keep rescue
              information updated.
            </p>
          </div>

          <div className="rescuer-welcome-icon">
            <PawPrint size={110} />
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="rescuer-section">
          <div className="rescuer-section-heading">
            <div>
              <h2>Overview</h2>
              <p>Your assigned rescue activity</p>
            </div>
          </div>

          <div className="rescuer-overview-grid">
            <div className="rescuer-overview-card">
              <div className="rescuer-overview-icon pink">
                <ClipboardList size={23} />
              </div>

              <p>Total Assigned Cases</p>
              <h2>{loading ? "..." : reports.length}</h2>
              <span>All cases assigned to you</span>
            </div>

            <div className="rescuer-overview-card">
              <div className="rescuer-overview-icon orange">
                <Clock size={23} />
              </div>

              <p>Active Cases</p>
              <h2>{loading ? "..." : activeCases}</h2>
              <span>Cases requiring rescue progress</span>
            </div>

            <div className="rescuer-overview-card">
              <div className="rescuer-overview-icon green">
                <CheckCircle size={23} />
              </div>

              <p>Rescued / Closed</p>
              <h2>{loading ? "..." : rescuedCases}</h2>
              <span>Cases marked rescued or closed</span>
            </div>
          </div>
        </section>

        {/* ASSIGNED CASES */}
        <section
          className="rescuer-section"
          id="assigned-cases"
        >
          <div className="rescuer-section-heading">
            <div>
              <h2>My Assigned Cases</h2>
              <p>Rescue reports assigned to your account</p>
            </div>
          </div>

          {loading ? (
            <div className="rescuer-empty">
              <RefreshCw size={30} />
              <p>Loading assigned cases...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="rescuer-empty">
              <ClipboardList size={42} />

              <h3>No assigned cases yet</h3>

              <p>
                Rescue cases assigned to you by the administrator
                will appear here.
              </p>
            </div>
          ) : (
            <div className="rescuer-cases-grid">
              {reports.map((report) => {
                const currentStatus = report.status || "Assigned";
                const nextStatus = getNextStatus(currentStatus);
                const animalImage = getAnimalImage(report);

                return (
                  <article
                    className="rescuer-case-card"
                    key={report.id}
                  >
                    {animalImage ? (
                      <img
                        src={animalImage}
                        alt={report.animalType || "Reported animal"}
                        className="rescuer-case-image"
                      />
                    ) : (
                      <div className="rescuer-case-image-placeholder">
                        <PawPrint size={48} />
                      </div>
                    )}

                    <div className="rescuer-case-content">
                      <div className="rescuer-case-top">
                        <span className="rescuer-case-label">
                          RESCUE CASE
                        </span>

                        <span
                          className={`rescuer-status ${getStatusClass(
                            currentStatus
                          )}`}
                        >
                          {currentStatus}
                        </span>
                      </div>

                      <h3>
                        {report.animalType || "Animal"}{" "}
                        {report.condition
                          ? `- ${report.condition}`
                          : ""}
                      </h3>

                      <p className="rescuer-case-description">
                        {report.description ||
                          report.additionalDetails ||
                          "No additional description provided."}
                      </p>

                      <div className="rescuer-case-info">
                        <p>
                          <MapPin size={16} />
                          {report.locationDescription ||
                            "Location unavailable"}
                        </p>

                        <p>
                          <Clock size={16} />
                          Assigned: {formatDate(report.assignedAt)}
                        </p>

                        {report.urgency && (
                          <p>
                            <AlertCircle size={16} />
                            Urgency: {report.urgency}
                          </p>
                        )}
                      </div>

                      <div className="rescuer-case-actions">
                        {nextStatus ? (
                          <button
                            type="button"
                            disabled={updatingId === report.id}
                            onClick={() => handleStatusUpdate(report)}
                          >
                            {updatingId === report.id
                              ? "Updating..."
                              : `Mark as ${nextStatus}`}
                          </button>
                        ) : (
                          <span className="rescuer-completed-label">
                            <CheckCircle size={17} />
                            Case completed
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default RescuerDashboard;
