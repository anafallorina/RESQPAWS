
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
  const [checkingRole, setCheckingRole] = useState(true);

  const closeMenu = () => setMenuOpen(false);

  // CHECK LOGIN AND USER ROLE
  useEffect(() => {
    let active = true;
    let requestId = 0;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const currentRequest = ++requestId;

      if (!active) return;

      setCurrentUser(user);
      setUserRole(null);
      setCheckingRole(true);

      if (!user) {
        setCheckingRole(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!active || currentRequest !== requestId) return;

        if (userSnapshot.exists()) {
          const role = userSnapshot.data().role;

          setUserRole(role === "admin" ? "admin" : "user");
        } else {
          setUserRole("user");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);

        if (active && currentRequest === requestId) {
          setUserRole("user");
        }
      } finally {
        if (active && currentRequest === requestId) {
          setCheckingRole(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // LOG OUT
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
      {/* LOGO */}
      <Link
        to="/"
        className="navbar-logo"
        onClick={closeMenu}
      >
        <PawPrint size={27} />

        <span>
          RESQ<span className="logo-pink">PAWS</span>
        </span>
      </Link>

      {/* MOBILE MENU BUTTON */}
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
        type="button"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      {/* NAVIGATION LINKS */}
      <div className={`navbar-links ${menuOpen ? "show-menu" : ""}`}>
        <NavLink to="/" onClick={closeMenu}>
          Home
        </NavLink>

        <NavLink to="/adoption" onClick={closeMenu}>
          Adoption
        </NavLink>

        <NavLink to="/rescue-cases" onClick={closeMenu}>
          Rescue Cases
        </NavLink>

        <div className="navbar-buttons">
          {!currentUser ? (
            <>
              {!checkingRole && (
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
              )}
            </>
          ) : checkingRole ? (
            <span>Loading account...</span>
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
                type="button"
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
