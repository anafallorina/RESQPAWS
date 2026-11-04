
import { Link, NavLink } from "react-router-dom";
import { PawPrint, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setUserRole(null);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));

          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeMenu();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        <PawPrint size={27} />
        <span>
          RESQ<span className="logo-pink">PAWS</span>
        </span>
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      <div className={`navbar-links ${menuOpen ? "show-menu" : ""}`}>
        <NavLink to="/" onClick={closeMenu}>Home</NavLink>
        <NavLink to="/adoption" onClick={closeMenu}>Adoption</NavLink>
        <NavLink to="/volunteer" onClick={closeMenu}>Volunteer</NavLink>
        <NavLink to="/rescue-cases" onClick={closeMenu}>
          Rescue Cases
        </NavLink>

        <div className="navbar-buttons">
          {!currentUser ? (
            <>
              <Link
                to="/login"
                className="login-btn"
                onClick={closeMenu}
              >
                Log In
              </Link>

              <Link
                to="/register"
                className="register-btn"
                onClick={closeMenu}
              >
                Join Us
              </Link>
            </>
          ) : (
            <>
              {userRole === "admin" ? (
                <Link
                  to="/admin"
                  className="login-btn"
                  onClick={closeMenu}
                >
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="login-btn"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              )}

              <button
                className="register-btn"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
