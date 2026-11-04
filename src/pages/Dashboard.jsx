
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint,
  LayoutDashboard,
  ClipboardList,
  Heart,
  HandHeart,
  Plus,
  Bell,
  UserRound,
  LogOut,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import "./Dashboard.css";

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let unsubscribeReports = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeReports();

      if (!user) {
        setReports([]);
        setUserEmail("");
        setLoading(false);
        return;
      }

      setUserEmail(user.email || "");

      setLoading(true);

      // Get only reports submitted by the logged-in user
      const reportsQuery = query(
        collection(db, "rescueReports"),
        where("reporterUid", "==", user.uid)
      );

      // Listen for real-time Firestore updates
      unsubscribeReports = onSnapshot(
        reportsQuery,
        (snapshot) => {
          const userReports = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          }));

          // Sort newest reports first
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
    });

    return () => {
      unsubscribeAuth();
      unsubscribeReports();
    };
  }, []);

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
          <span>RESQ<span>PAWS</span></span>
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

          <Link to="/volunteer" className="sidebar-link">
            <HandHeart size={19} />
            Volunteer
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
            <button
              className="notification-button"
              aria-label="Notifications"
              type="button"
            >
              <Bell size={20} />
            </button>

            <div className="user-avatar">
              <UserRound size={21} />
            </div>

            <span title={userEmail}>
              My Account
            </span>
          </div>
        </header>

        {/* WELCOME BANNER */}
        <section className="dashboard-welcome">
          <div>
            <span>WELCOME TO RESQPAWS</span>

            <h1>
              Every little action<br />
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

            {/* TOTAL REPORTS */}
            <div className="overview-card">
              <div className="overview-icon pink">
                <ClipboardList size={23} />
              </div>

              <p>Total Reports</p>

              <h2>
                {loading ? "..." : reports.length}
              </h2>

              <span>Your submitted rescue reports</span>
            </div>

            {/* RESOLVED REPORTS */}
            <div className="overview-card">
              <div className="overview-icon green">
                <Heart size={23} />
              </div>

              <p>Resolved Reports</p>

              <h2>
                {loading ? "..." : resolvedReports}
              </h2>

              <span>Your reports marked as resolved</span>
            </div>

            {/* VOLUNTEER ACTIVITIES */}
            <div className="overview-card">
              <div className="overview-icon pink">
                <HandHeart size={23} />
              </div>

              <p>Volunteer Activities</p>

              <h2>0</h2>

              <span>Your volunteer participation</span>
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

            <Link to="/volunteer" className="quick-card">
              <div className="quick-icon">
                <HandHeart size={24} />
              </div>

              <h3>Become a Volunteer</h3>

              <p>
                Help make animal rescue possible.
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

            <Link to="/rescue-cases">
              View All
            </Link>
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

                    <p>
                      {formatDate(report.createdAt)}
                    </p>

                    {report.locationDescription && (
                      <small>
                        {report.locationDescription}
                      </small>
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
