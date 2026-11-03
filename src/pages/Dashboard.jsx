
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

import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">

      {/* Sidebar */}
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

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h2>Dashboard</h2>
            <p>Welcome back! Here's your RESQPAWS overview.</p>
          </div>

          <div className="dashboard-user">
            <button className="notification-button" aria-label="Notifications">
              <Bell size={20} />
            </button>

            <div className="user-avatar">
              <UserRound size={21} />
            </div>

            <span>My Account</span>
          </div>
        </header>

        {/* Welcome Banner */}
        <section className="dashboard-welcome">
          <div>
            <span>WELCOME TO RESQPAWS</span>
            <h1>Every little action<br />can save a life.</h1>
            <p>
              Help protect animals, report cases, and make
              a difference in your community.
            </p>

            <Link to="/report-animal" className="dashboard-primary-btn">
              <Plus size={18} />
              Report an Animal
            </Link>
          </div>

          <div className="welcome-paw">
            <PawPrint size={120} />
          </div>
        </section>

        {/* Overview Cards */}
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
              <h2>0</h2>
              <span>No reports submitted yet</span>
            </div>

            <div className="overview-card">
              <div className="overview-icon green">
                <Heart size={23} />
              </div>
              <p>Rescued Animals</p>
              <h2>0</h2>
              <span>Animals rescued through your reports</span>
            </div>

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

        {/* Quick Access */}
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
              <p>Report stray, injured, or abandoned animals.</p>
              <ArrowUpRight size={19} className="quick-arrow" />
            </Link>

            <Link to="/rescue-cases" className="quick-card">
              <div className="quick-icon">
                <ClipboardList size={24} />
              </div>
              <h3>Track Rescue Cases</h3>
              <p>Check updates on your submitted reports.</p>
              <ArrowUpRight size={19} className="quick-arrow" />
            </Link>

            <Link to="/adoption" className="quick-card">
              <div className="quick-icon">
                <Heart size={24} />
              </div>
              <h3>Find a Companion</h3>
              <p>Discover animals waiting for adoption.</p>
              <ArrowUpRight size={19} className="quick-arrow" />
            </Link>

            <Link to="/volunteer" className="quick-card">
              <div className="quick-icon">
                <HandHeart size={24} />
              </div>
              <h3>Become a Volunteer</h3>
              <p>Help make animal rescue possible.</p>
              <ArrowUpRight size={19} className="quick-arrow" />
            </Link>

          </div>
        </section>

        {/* Recent Activity */}
        <section className="dashboard-section recent-activity">
          <h2>Recent Activity</h2>

          <div className="activity-empty">
            <ClipboardList size={35} />
            <h3>No recent activity</h3>
            <p>Your reports and activities will appear here.</p>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Dashboard;
