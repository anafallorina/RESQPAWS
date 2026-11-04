
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Heart,
  PawPrint,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";
import AdminRescueReports from "../components/AdminRescueReports";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Rescue Reports", icon: ClipboardList },
    { name: "Adoption Management", icon: Heart },
  ];

  return (
    <div className="admin-layout">

      {/* MOBILE MENU BUTTON */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/" className="admin-logo">
          <PawPrint size={28} />
          <span>RESQ<span>PAWS</span></span>
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

        <header className="admin-header">
          <div>
            <p className="admin-header-subtitle">RESQPAWS ADMINISTRATION</p>
            <h1>{activeTab}</h1>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              <PawPrint size={20} />
            </div>
            <div>
              <strong>Administrator</strong>
              <span>Admin</span>
            </div>
          </div>
        </header>

        {/* OVERVIEW */}
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

            <div className="admin-stat-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <ClipboardList />
                </div>
                <p>Total Rescue Reports</p>
                <h2>--</h2>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <Heart />
                </div>
                <p>Adoption Listings</p>
                <h2>--</h2>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  <PawPrint />
                </div>
                <p>Available Animals</p>
                <h2>--</h2>
              </div>
            </div>

            <div className="admin-section-card">
              <h3>Management Overview</h3>
              <p>
                Select Rescue Reports to review submitted reports
                or Adoption Management to manage animals available
                for adoption.
              </p>
            </div>
          </section>
        )}

       {/* RESCUE REPORTS */}
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


        {/* ADOPTION MANAGEMENT */}
        {activeTab === "Adoption Management" && (
          <section className="admin-content">
            <div className="admin-section-card">
              <h2>Adoption Management</h2>
              <p>
                Add and manage animals available for adoption.
              </p>
              <div className="admin-coming-soon">
                Adoption listing management will be connected to Firebase next.
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default AdminDashboard;
