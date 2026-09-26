import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Mail, Lock, User } from "lucide-react";
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
    <main className="auth-page">
      <div className="auth-card">
        <div className="brand-icon">
          <CalendarDays size={28} />
        </div>

        <h1>Create account</h1>
        <p className="auth-subtitle">
          Start managing events in real time.
        </p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            Full Name
            <div className="input-wrapper">
              <User size={18} />
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label>
            Email
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label>
            Password
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label>
            Account Type
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="attendee">Attendee</option>
              <option value="organizer">Organizer</option>
            </select>
          </label>

          <button className="primary-button" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}