
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  PawPrint,
  LayoutDashboard,
  ClipboardList,
  Heart,
  Plus,
  Bell,
  UserRound,
  LogOut,
  MapPin,
  ArrowUpRight,
  Volume2,
  VolumeX,
} from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import NotificationPanel from "../components/NotificationPanel";
import { playNotificationSound } from "../utils/notifications";

import "./Dashboard.css";

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const firstNotificationSnapshot = useRef(true);
  const alarmInterval = useRef(null);

  // LOAD USER REPORTS AND NOTIFICATIONS
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
        setUserEmail("");
        setLoading(false);
        setNotificationOpen(false);
        return;
      }

      setUserEmail(user.email || "");
      setLoading(true);

      // USER'S RESCUE REPORTS
      const reportsQuery = query(
        collection(db, "rescueReports"),
        where("reporterUid", "==", user.uid)
      );

      unsubscribeReports = onSnapshot(
        reportsQuery,
        (snapshot) => {
          const userReports = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }));

          userReports.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
            const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
            return dateB - dateA;
          });

          setReports(userReports);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching dashboard reports:", error);
          setLoading(false);
        }
      );

      // USER'S NOTIFICATIONS
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
            const dateA = a.createdAt?.toDate?.()?.getTime() || 0;
            const dateB = b.createdAt?.toDate?.()?.getTime() || 0;
            return dateB - dateA;
          });

          // Ignore existing notifications on initial load.
          // Only newly added notifications trigger the alarm.
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
          console.error("Error fetching notifications:", error);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeReports();
      unsubscribeNotifications();
    };
  }, []);

  // UNREAD NOTIFICATION COUNT
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // REPEATING ALARM EVERY 5 SECONDS
  useEffect(() => {
    const hasUnread = notifications.some(
      (notification) => !notification.read
    );

    if (soundEnabled && hasUnread) {
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

  // MARK NOTIFICATION AS READ
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

  // ENABLE OR DISABLE SOUND
  const handleSoundToggle = () => {
    if (!soundEnabled) {
      // This click allows the browser to start audio playback.
      playNotificationSound();
      setSoundEnabled(true);
    } else {
      setSoundEnabled(false);
    }
  };

  const resolvedReports = reports.filter(
    (report) => report.status?.toLowerCase() === "resolved"
  ).length;

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Date unavailable";

    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "pending";
      case "under review":
        return "under-review";
      case "in progress":
        return "in-progress";
      case "resolved":
        return "resolved";
      default:
        return "pending";
    }
  };

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-logo">
          <PawPrint size={27} />
          <span>
            RESQ<span>PAWS</span>
          </span>
        </Link>

        <p className="sidebar-label">MAIN MENU</p>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-link active">
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link to="/report-animal" className="sidebar-link">
            <Plus size={19} />
            Report an Animal
          </Link>

          <Link to="/rescue-cases" className="sidebar-link">
            <ClipboardList size={19} />
            Rescue Cases
          </Link>

          <Link to="/adoption" className="sidebar-link">
            <Heart size={19} />
            Adoption
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <Link to="/" className="sidebar-link">
            <LogOut size={19} />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <h2>Dashboard</h2>
            <p>Welcome back! Here's your RESQPAWS overview.</p>
          </div>

          <div className="dashboard-user">
            {/* NOTIFICATION CONTROLS */}
            <div style={{ position: "relative" }}>
              <button
                className="notification-button"
                aria-label="Notifications"
                type="button"
                onClick={() => setNotificationOpen((previous) => !previous)}
                style={{ position: "relative" }}
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      minWidth: "18px",
                      height: "18px",
                      padding: "0 4px",
                      borderRadius: "20px",
                      background: "#e34d79",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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

            {/* ALARM CONTROL */}
            <button
              type="button"
              onClick={handleSoundToggle}
              title={soundEnabled ? "Turn alarm off" : "Turn alarm on"}
              aria-label={soundEnabled ? "Turn alarm off" : "Turn alarm on"}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: soundEnabled ? "#d94b78" : "inherit",
              }}
            >
              {soundEnabled ? (
                <Volume2 size={20} />
              ) : (
                <VolumeX size={20} />
              )}
            </button>

            <div className="user-avatar">
              <UserRound size={21} />
            </div>

            <span title={userEmail}>My Account</span>
          </div>
        </header>

        {/* WELCOME BANNER */}
        <section className="dashboard-welcome">
          <div>
            <span>WELCOME TO RESQPAWS</span>

            <h1>
              Every little action
              <br />
              can save a life.
            </h1>

            <p>
              Help protect animals, report cases, and make
              a difference in your community.
            </p>

            <Link
              to="/report-animal"
              className="dashboard-primary-btn"
            >
              <Plus size={18} />
              Report an Animal
            </Link>
          </div>

          <div className="welcome-paw">
            <PawPrint size={120} />
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Overview</h2>
              <p>Your activity summary</p>
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-icon pink">
                <ClipboardList size={23} />
              </div>

              <p>Total Reports</p>
              <h2>{loading ? "..." : reports.length}</h2>
              <span>Your submitted rescue reports</span>
            </div>

            <div className="overview-card">
              <div className="overview-icon green">
                <Heart size={23} />
              </div>

              <p>Resolved Reports</p>
              <h2>{loading ? "..." : resolvedReports}</h2>
              <span>Your reports marked as resolved</span>
            </div>
          </div>
        </section>

        {/* QUICK ACCESS */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Quick Access</h2>
              <p>What would you like to do today?</p>
            </div>
          </div>

          <div className="quick-access-grid">
            <Link to="/report-animal" className="quick-card">
              <div className="quick-icon">
                <MapPin size={24} />
              </div>

              <h3>Report an Animal</h3>

              <p>
                Report stray, injured, or abandoned animals.
              </p>

              <ArrowUpRight size={19} className="quick-arrow" />
            </Link>

            <Link to="/rescue-cases" className="quick-card">
              <div className="quick-icon">
                <ClipboardList size={24} />
              </div>

              <h3>Track Rescue Cases</h3>

              <p>
                Check updates on your submitted reports.
              </p>

              <ArrowUpRight size={19} className="quick-arrow" />
            </Link>

            <Link to="/adoption" className="quick-card">
              <div className="quick-icon">
                <Heart size={24} />
              </div>

              <h3>Find a Companion</h3>

              <p>
                Discover animals waiting for adoption.
              </p>

              <ArrowUpRight size={19} className="quick-arrow" />
            </Link>
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section className="dashboard-section recent-activity">
          <div className="recent-activity-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Your latest submitted rescue reports</p>
            </div>

            <Link to="/rescue-cases">View All</Link>
          </div>

          {loading ? (
            <div className="activity-empty">
              <p>Loading your reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="activity-empty">
              <ClipboardList size={35} />

              <h3>No recent activity</h3>

              <p>
                Your submitted rescue reports will appear here.
              </p>

              <Link
                to="/report-animal"
                className="activity-report-link"
              >
                Submit Your First Report
              </Link>
            </div>
          ) : (
            <div className="dashboard-activity-list">
              {reports.slice(0, 5).map((report) => (
                <div
                  className="dashboard-activity-item"
                  key={report.id}
                >
                  <div className="activity-report-icon">
                    <PawPrint size={21} />
                  </div>

                  <div className="activity-report-info">
                    <h3>
                      {report.animalType || "Animal"} -{" "}
                      {report.condition || "Reported"}
                    </h3>

                    <p>{formatDate(report.createdAt)}</p>

                    {report.locationDescription && (
                      <small>{report.locationDescription}</small>
                    )}
                  </div>

                  <span
                    className={`dashboard-report-status ${getStatusClass(
                      report.status
                    )}`}
                  >
                    {report.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
