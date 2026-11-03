
import { useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Mail, ArrowLeft, Send } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./ForgetPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Firebase password reset will be connected here.
  };

  return (
    <div className="forgot-page">
      <Navbar />

      <main className="forgot-main">
        <div className="forgot-card">
          <div className="forgot-icon">
            <Mail size={38} />
          </div>

          <span className="section-tag">ACCOUNT RECOVERY</span>
          <h1>Forgot Your Password?</h1>
          <p>
            Don't worry! Enter the email address associated
            with your account. We'll help you reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="reset-email">Email Address</label>

            <div className="forgot-input">
              <Mail size={19} />
              <input
                id="reset-email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="forgot-submit">
              Send Reset Link <Send size={17} />
            </button>
          </form>

          <Link to="/login" className="forgot-back">
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <div className="forgot-brand">
            <PawPrint size={17} /> RESQPAWS
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ForgotPassword;
