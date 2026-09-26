import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  LogOut,
  Search,
  Clock,
} from "lucide-react";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const isOrganizer = profile?.role === "organizer";

  useEffect(() => {
    const eventsQuery = query(
      collection(db, "events"),
      where("status", "==", "PUBLISHED"),
      orderBy("eventDate", "asc")
    );

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const eventList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvents(eventList);
        setLoading(false);
      },
      (error) => {
        console.error("Events listener error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredEvents = events.filter((event) => {
    const searchText = search.toLowerCase();

    return (
      event.eventName?.toLowerCase().includes(searchText) ||
      event.venue?.toLowerCase().includes(searchText) ||
      event.eventType?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <div
          className="brand"
          onClick={() => navigate("/dashboard")}
        >
          <div className="brand-icon">✦</div>

          <span>Live Event Platform</span>
        </div>

        <div className="navbar-actions">
          <span className="user-name">
            {profile?.name || user?.displayName || "User"}
          </span>

          <span className="role-badge">
            {isOrganizer ? "Organizer" : "Attendee"}
          </span>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div>
            <p className="eyebrow">
              LIVE EVENT PLATFORM
            </p>

            <h1>
              Welcome,{" "}
              {profile?.name ||
                user?.displayName ||
                "there"}
              .
            </h1>

            <p className="hero-description">
              {isOrganizer
                ? "Create events, manage RSVPs, publish announcements, and check in attendees in real time."
                : "Discover events, manage your RSVPs, and stay updated with upcoming events."}
            </p>
          </div>

          {isOrganizer && (
            <button
              className="primary-button create-event-button"
              onClick={() =>
                navigate("/create-event")
              }
            >
              <Plus size={20} />
              Create Event
            </button>
          )}
        </section>

        <section className="events-section">
          <div className="events-header">
            <div>
              <h2>Upcoming events</h2>

              <p>
                {filteredEvents.length}{" "}
                {filteredEvents.length === 1
                  ? "event"
                  : "events"}{" "}
                available
              </p>
            </div>

            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>

          {loading && (
            <div className="empty-state">
              <div className="spinner"></div>

              <p>Loading events...</p>
            </div>
          )}

          {!loading &&
            filteredEvents.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <Calendar size={32} />
                </div>

                <h3>No events found</h3>

                <p>
                  {search
                    ? "Try a different search."
                    : isOrganizer
                    ? "Create your first event to get started."
                    : "There are no published events available right now."}
                </p>

                {!search && isOrganizer && (
                  <button
                    className="primary-button"
                    onClick={() =>
                      navigate("/create-event")
                    }
                  >
                    <Plus size={18} />
                    Create Event
                  </button>
                )}
              </div>
            )}

          {!loading &&
            filteredEvents.length > 0 && (
              <div className="events-grid">
                {filteredEvents.map((event) => (
                  <article
                    className="event-card"
                    key={event.id}
                    onClick={() =>
                      navigate(
                        `/events/${event.id}`
                      )
                    }
                  >
                    <div className="event-card-top">
                      <span className="event-type">
                        {event.eventType ||
                          "Event"}
                      </span>

                      <span className="event-status">
                        {event.status}
                      </span>
                    </div>

                    <h3>{event.eventName}</h3>

                    {event.description && (
                      <p className="event-description">
                        {event.description}
                      </p>
                    )}

                    <div className="event-info">
                      <div>
                        <Calendar size={17} />
                        <span>
                          {event.eventDate}
                        </span>
                      </div>

                      <div>
                        <Clock size={17} />

                        <span>
                          {event.startTime}

                          {event.endTime
                            ? ` - ${event.endTime}`
                            : ""}
                        </span>
                      </div>

                      <div>
                        <MapPin size={17} />

                        <span>
                          {event.venue}
                        </span>
                      </div>

                      <div>
                        <Users size={17} />

                        <span>
                          {event.goingCount ||
                            0}{" "}
                          /{" "}
                          {
                            event.maximumCapacity
                          }{" "}
                          going
                        </span>
                      </div>
                    </div>

                    <button
                      className="view-event-button"
                      onClick={(e) => {
                        e.stopPropagation();

                        navigate(
                          `/events/${event.id}`
                        );
                      }}
                    >
                      View Event
                    </button>
                  </article>
                ))}
              </div>
            )}
        </section>
      </main>
    </div>
  );
}