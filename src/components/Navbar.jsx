import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Plus,
  UserCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/dashboard" className="brand">
        <div className="brand-icon">
          <CalendarDays size={21} />
        </div>

        <div>
          <strong>EventFlow</strong>
          <span>RSVP Manager</span>
        </div>
      </Link>

      {user && (
        <nav className="nav-links">
          <Link to="/dashboard">
            <LayoutDashboard size={17} />
            Events
          </Link>

          <Link to="/my-rsvps">
            My RSVPs
          </Link>

          {profile?.role === "organizer" && (
            <>
              <Link to="/create-event">
                <Plus size={17} />
                Create Event
              </Link>

              <Link to="/organizer-dashboard">
                Organizer
              </Link>
            </>
          )}

          <div className="user-menu">
            <UserCircle size={18} />
            <span>{profile?.fullName || user.email}</span>
          </div>

          <button
            className="icon-button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </nav>
      )}
    </header>
  );
}