
import { useEffect, useRef, useState } from "react";

import {
  LayoutDashboard,
  ClipboardList,
  Heart,
  PawPrint,
  Menu,
  X,
  FileText,
  Bell,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

import NotificationPanel from "../components/NotificationPanel";
import { playNotificationSound } from "../utils/notifications";

import "./AdminDashboard.css";

import AdminRescueReports from "../components/AdminRescueReports";
import AdoptionManagement from "../components/AdoptionManagement";
import AdminAdoptionApplications from "../components/AdminAdoptionApplications";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // NOTIFICATION STATES
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const firstNotificationSnapshot = useRef(true);
  const alarmInterval = useRef(null);

  // ORIGINAL OVERVIEW COUNT STATES
  const [totalRescueReports, setTotalRescueReports] = useState(0);
  const [totalAdoptionListings, setTotalAdoptionListings] = useState(0);
  const [availableAnimals, setAvailableAnimals] = useState(0);

  // =====================================
  // REAL-TIME RESCUE REPORT COUNT
  // =====================================
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "rescueReports"),
      (snapshot) => {
        setTotalRescueReports(snapshot.size);
      },
      (error) => {
        console.error("Rescue report listener error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // =====================================
  // REAL-TIME ADOPTION LISTING COUNTS
  // =====================================
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "adoptionListings"),
      (snapshot) => {
        setTotalAdoptionListings(snapshot.size);

        const availableCount = snapshot.docs.filter(
          (animal) => animal.data().status === "Available"
        ).length;

        setAvailableAnimals(availableCount);
      },
      (error) => {
        console.error("Adoption listing count error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // =====================================
  // LISTEN FOR ADMIN NOTIFICATIONS
  // =====================================
  useEffect(() => {
    firstNotificationSnapshot.current = true;

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("recipientUid", "==", "admins")
    );

    const unsubscribe = onSnapshot(
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
        console.error("Admin notification listener error:", error);
      }
    );

    return () => unsubscribe();
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
  // SIDEBAR MENU
  // =====================================
  const menuItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Rescue Reports", icon: ClipboardList },
    { name: "Adoption Management", icon: Heart },
    { name: "Adoption Applications", icon: FileText },
  ];

  return (
    <div className="admin-layout">

      {/* MOBILE MENU BUTTON */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle admin menu"
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/" className="admin-logo">
          <PawPrint size={28} />

          <span>
            RESQ<span>PAWS</span>
          </span>
        </Link>

        <p className="admin-menu-label">MAIN MENU</p>

        <nav className="admin-navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={
                  activeTab === item.name ? "admin-nav-active" : ""
                }
                onClick={() => {
                  setActiveTab(item.name);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={19} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <Link to="/" className="admin-back-home">
            <PawPrint size={18} />
            Back to Website
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">

        {/* HEADER */}
        <header className="admin-header">
          <div>
            <p className="admin-header-subtitle">
              RESQPAWS ADMINISTRATION
            </p>

            <h1>{activeTab}</h1>
          </div>

          <div
            className="admin-profile"
            style={{ gap: "16px" }}
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
              }}
            >
              {soundEnabled ? (
                <Volume2 size={20} />
              ) : (
                <VolumeX size={20} />
              )}
            </button>

            {/* NOTIFICATION BUTTON */}
            <div style={{ position: "relative" }}>
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

            {/* ADMIN PROFILE */}
            <div className="admin-avatar">
              <PawPrint size={20} />
            </div>

            <div>
              <strong>Administrator</strong>
              <span>Admin</span>
            </div>
          </div>
        </header>

        {/* =====================================
            ORIGINAL OVERVIEW
        ===================================== */}
        {activeTab === "Overview" && (
          <section className="admin-content">

            <div className="admin-welcome">
              <div>
                <h2>Welcome to ResQPaws!</h2>

                <p>
                  Manage rescue reports and adoption listings
                  from one place.
                </p>
              </div>

              <PawPrint size={65} />
            </div>

            {/* ORIGINAL STATISTICS */}
            <div className="admin-stat-grid">

              {/* TOTAL RESCUE REPORTS */}
              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <ClipboardList />
                </div>

                <p>Total Rescue Reports</p>

                <h2>{totalRescueReports}</h2>
              </div>

              {/* TOTAL ADOPTION LISTINGS */}
              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <Heart />
                </div>

                <p>Adoption Listings</p>

                <h2>{totalAdoptionListings}</h2>
              </div>

              {/* AVAILABLE ANIMALS */}
              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <PawPrint />
                </div>

                <p>Available Animals</p>

                <h2>{availableAnimals}</h2>
              </div>

            </div>

            {/* MANAGEMENT OVERVIEW */}
            <div className="admin-section-card">
              <h3>Management Overview</h3>

              <p>
                Select Rescue Reports to review submitted reports,
                Adoption Management to manage animals available
                for adoption, or Adoption Applications to review
                and process adoption requests.
              </p>
            </div>

          </section>
        )}

        {/* =====================================
            RESCUE REPORTS
        ===================================== */}
        {activeTab === "Rescue Reports" && (
          <section className="admin-content">
            <div className="admin-section-card">
              <h2>Rescue Reports</h2>

              <p>
                Review and manage animal rescue reports submitted
                by users.
              </p>

              <AdminRescueReports />
            </div>
          </section>
        )}

        {/* =====================================
            ADOPTION MANAGEMENT
        ===================================== */}
        {activeTab === "Adoption Management" && (
          <section className="admin-content">
            <div className="admin-section-card">
              <h2>Adoption Management</h2>

              <p>
                Add, edit, and manage animals available for adoption.
              </p>

              <AdoptionManagement />
            </div>
          </section>
        )}

        {/* =====================================
            ADOPTION APPLICATIONS
        ===================================== */}
        {activeTab === "Adoption Applications" && (
          <section className="admin-content">
            <div className="admin-section-card">
              <h2>Adoption Applications</h2>

              <p>
                Review applications submitted by users and update
                their application status.
              </p>

              <AdminAdoptionApplications />
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default AdminDashboard;
