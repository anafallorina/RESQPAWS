
import { useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Firebase login will be connected here.
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
              <span className="section-tag">WELCOME TO RESQPAWS</span>
              <h1>Log In</h1>
              <p>Enter your account details to continue.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="login-field">
                <label htmlFor="email">Email Address</label>
                <div className="login-input">
                  <Mail size={19} />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>
                <div className="login-input">
                  <Lock size={19} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-label">
                  <input type="checkbox" />
                  Remember me
                </label>

                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="login-submit">
                Log In <ArrowRight size={18} />
              </button>
            </form>

            <div className="login-register">
              Don't have an account?
              <Link to="/register"> Create an account</Link>
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
