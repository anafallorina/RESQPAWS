
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PawPrint,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await setPersistence(
        auth,
        rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence
      );

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const currentUser = userCredential.user;

      const userRef = doc(db, "users", currentUser.uid);
      const userSnapshot = await getDoc(userRef);

      if (
        !userSnapshot.exists() ||
        userSnapshot.data().role !== "admin"
      ) {
        await signOut(auth);
        setError("Access denied. This account is not an administrator.");
        return;
      }

      navigate("/admin", { replace: true });

    } catch (error) {
      console.error("Admin login error:", error);

      switch (error.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Incorrect email or password.");
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your connection.");
          break;

        default:
          setError("Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <main className="admin-login-main">
        <div className="admin-login-container">

          <section className="admin-login-illustration">
            <div className="admin-login-paw">
              <PawPrint size={85} />
            </div>

            <h2>RESQPAWS</h2>

            <p>
              Administrator Portal
            </p>

            <div className="admin-login-message">
              <ShieldCheck size={17} />
              Authorized Personnel Only
            </div>
          </section>

          <section className="admin-login-form-section">
            <div className="admin-login-heading">
              <span>ADMINISTRATOR ACCESS</span>

              <h1>Admin Login</h1>

              <p>
                Sign in using your authorized administrator account.
              </p>
            </div>

            <form onSubmit={handleLogin}>
              {error && (
                <div className="admin-login-error" role="alert">
                  {error}
                </div>
              )}

              <div className="admin-login-field">
                <label htmlFor="admin-email">
                  Email Address
                </label>

                <div className="admin-login-input">
                  <Mail size={19} />

                  <input
                    id="admin-email"
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="admin-login-field">
                <label htmlFor="admin-password">
                  Password
                </label>

                <div className="admin-login-input">
                  <Lock size={19} />

                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword
                      ? <EyeOff size={19} />
                      : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="admin-login-options">
                <label>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="admin-login-submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Access Dashboard"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <Link to="/login" className="admin-back-login">
              Back to User Login
            </Link>

            <Link to="/" className="admin-back-home">
              Back to Home
            </Link>
          </section>

        </div>
      </main>
    </div>
  );
}

export default AdminLogin;
