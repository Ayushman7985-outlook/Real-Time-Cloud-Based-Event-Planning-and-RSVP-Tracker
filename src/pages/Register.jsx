import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "attendee",
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

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await register(
        form.name,
        form.email,
        form.password,
        form.role
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-modern-page">
      <div className="auth-modern-shell register-shell">
        <section className="auth-brand-panel">
          <div className="auth-brand-top">
            <div className="auth-brand-mark">
              <CalendarDays size={21} />
            </div>

            <span>Live Event Platform</span>
          </div>

          <div className="auth-brand-content">
            <div className="auth-pill">
              <span className="auth-live-dot"></span>
              Built for live events
            </div>

            <h2>
              Plan smarter.
              <span> Connect better.</span>
            </h2>

            <p>
              One cloud platform for event creation, invitations,
              RSVPs, capacity management and attendee check-in.
            </p>

            <div className="auth-stat-grid">
              <div>
                <strong>Live</strong>
                <span>RSVP updates</span>
              </div>

              <div>
                <strong>QR</strong>
                <span>Invitations</span>
              </div>

              <div>
                <strong>Cloud</strong>
                <span>Powered</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            Built with React + Firebase
          </div>
        </section>

        <section className="auth-modern-card">
          <div className="auth-modern-heading">
            <div className="auth-mobile-logo">
              <CalendarDays size={22} />
            </div>

            <p className="auth-modern-kicker">
              GET STARTED
            </p>

            <h1>Create your account</h1>

            <p>
              Set up your profile and start managing events in
              real time.
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
              <label htmlFor="register-name">
                Full name
              </label>

              <div className="auth-input">
                <User size={18} />

                <input
                  id="register-name"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">
                Email address
              </label>

              <div className="auth-input">
                <Mail size={18} />

                <input
                  id="register-email"
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
              <label htmlFor="register-password">
                Password
              </label>

              <div className="auth-input">
                <Lock size={18} />

                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 6 characters"
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

            <div className="auth-field">
              <label htmlFor="register-role">
                Account type
              </label>

              <div className="auth-select-wrapper">
                <select
                  id="register-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="attendee">
                    Attendee — Join events
                  </option>

                  <option value="organizer">
                    Organizer — Create events
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-modern-divider">
            <span>OR</span>
          </div>

          <p className="auth-modern-footer">
            Already have an account?
            <Link to="/login">
              Sign in
              <ArrowRight size={15} />
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}