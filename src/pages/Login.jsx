
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  PawPrint,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      const userRole = userSnapshot.exists()
        ? userSnapshot.data().role
        : "user";

      // ADMINS ALWAYS GO TO ADMIN DASHBOARD
      if (userRole === "admin") {
        navigate("/admin", { replace: true });
      } else {
        // RETURN USER TO THE PAGE THEY ORIGINALLY REQUESTED
        const destination = location.state?.from;

        if (destination?.pathname) {
          navigate(
            `${destination.pathname}${destination.search || ""}`,
            { replace: true }
          );
        } else {
          navigate("/dashboard", { replace: true });
        }
      }

    } catch (error) {
      console.error("Login error:", error);

      switch (error.code) {
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;

        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Incorrect email or password. Please try again.");
          break;

        case "auth/too-many-requests":
          setError("Too many login attempts. Please try again later.");
          break;

        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;

        default:
          setError("Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Navbar />

      <main className="login-main">
        <div className="login-container">

          <div className="login-illustration">
            <div className="login-paw">
              <PawPrint size={100} />
            </div>

            <h2>Welcome Back!</h2>

            <p>
              Every little action helps save a life.
              Continue being part of the RESQPAWS community.
            </p>

            <div className="login-message">
              <span>♡</span> Together, we give every paw hope.
            </div>
          </div>

          <div className="login-form-section">
            <div className="login-heading">
              <span className="section-tag">
                WELCOME TO RESQPAWS
              </span>

              <h1>Log In</h1>

              <p>Enter your account details to continue.</p>
            </div>

            <form onSubmit={handleLogin}>

              {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
              )}

              <div className="login-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="login-input">
                  <Mail size={19} />

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="login-input">
                  <Lock size={19} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword
                      ? <EyeOff size={19} />
                      : <Eye size={19} />
                    }
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                  />
                  Remember me
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}

                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="login-register">
              Don't have an account?
              <Link to="/register">
                {" "}Create an account
              </Link>
            </div>

            <Link to="/" className="back-home">
              Back to Home
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Login;
