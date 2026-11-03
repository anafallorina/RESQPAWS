
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase";

import {
  PawPrint,
  UserRound,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. CREATE FIREBASE AUTHENTICATION ACCOUNT
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );

      const user = userCredential.user;

      // 2. SAVE USER'S DISPLAY NAME
      await updateProfile(user, {
        displayName: formData.fullName.trim()
      });

      // 3. SAVE USER INFORMATION IN FIRESTORE
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        contactNumber: formData.contactNumber.trim(),
        role: "user",
        createdAt: serverTimestamp()
      });

      alert("Your RESQPAWS account has been created successfully!");

      // 4. GO TO DASHBOARD
      navigate("/dashboard");

    } catch (error) {
      console.error("Registration error:", error);

      let message = "Registration failed. Please try again.";

      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already registered.";
          break;

        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;

        case "auth/weak-password":
          message = "Your password is too weak. Use at least 6 characters.";
          break;

        case "permission-denied":
          message = "Database permission denied. Please check your Firestore security rules.";
          break;

        default:
          message = error.message;
      }

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Navbar />

      <main className="register-main">
        <div className="register-container">

          {/* LEFT SIDE */}
          <div className="register-illustration">
            <div className="register-paw">
              <PawPrint size={95} />
            </div>

            <h2>Be Their Hope.</h2>

            <p>
              Join the RESQPAWS community and become
              part of something meaningful. Together,
              we can make a difference in the lives of animals.
            </p>

            <div className="register-message">
              <span>♡</span> Every paw deserves a loving chance.
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="register-form-section">
            <div className="register-heading">
              <span className="section-tag">JOIN THE RESQPAWS COMMUNITY</span>
              <h1>Create Account</h1>
              <p>Fill in your details to get started.</p>
            </div>

            <form onSubmit={handleRegister}>

              <div className="register-field">
                <label htmlFor="fullName">Full Name</label>
                <div className="register-input">
                  <UserRound size={18} />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="email">Email Address</label>
                <div className="register-input">
                  <Mail size={18} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="contactNumber">Contact Number</label>
                <div className="register-input">
                  <Phone size={18} />
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    placeholder="Enter your contact number"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="password">Password</label>
                <div className="register-input">
                  <Lock size={18} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="register-input">
                  <Lock size={18} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="register-terms">
                <input type="checkbox" required />
                <span>
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="register-login">
              Already have an account?
              <Link to="/login"> Log In</Link>
            </div>

            <Link to="/" className="register-back">
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Register;
