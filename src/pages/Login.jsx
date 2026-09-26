import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      await login(form.email, form.password);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-modern-page">
      <div className="auth-modern-shell">
        <section className="auth-brand-panel">
          <div className="auth-brand-top">
            <div className="auth-brand-mark">
              <CalendarDays size={21} />
            </div>

            <span>Live Event Platform</span>
          </div>

          <div className="auth-brand-content">
            <div className="auth-pill">
              <Sparkles size={14} />
              Real-time event management
            </div>

            <h2>
              Bring every event
              <span> to life.</span>
            </h2>

            <p>
              Create events, collect RSVPs, manage capacity and
              keep your attendees connected in real time.
            </p>

            <div className="auth-feature-list">
              <div>
                <span className="auth-feature-dot"></span>
                Live RSVP tracking
              </div>

              <div>
                <span className="auth-feature-dot"></span>
                QR-based invitations
              </div>

              <div>
                <span className="auth-feature-dot"></span>
                Real-time attendee check-in
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            Cloud-powered event management
          </div>
        </section>

        <section className="auth-modern-card">
          <div className="auth-modern-heading">
            <div className="auth-mobile-logo">
              <CalendarDays size={22} />
            </div>

            <p className="auth-modern-kicker">WELCOME BACK</p>

            <h1>Sign in to your account</h1>

            <p>
              Manage your events and stay connected with your
              attendees.
            </p>
          </div>

          {error && (
            <div className="auth-modern-error">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="auth-modern-form"
          >
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>

              <div className="auth-input">
                <Mail size={18} />

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="login-password">
                  Password
                </label>
              </div>

              <div className="auth-input">
                <Lock size={18} />

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-modern-divider">
            <span>OR</span>
          </div>

          <p className="auth-modern-footer">
            New to Live Event Platform?
            <Link to="/register">
              Create an account
              <ArrowRight size={15} />
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}