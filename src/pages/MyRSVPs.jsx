import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import RSVPButton from "../components/RSVPButton";
import Loading from "../components/Loading";

import {
  getEvent,
  subscribeToEventRSVPs,
  subscribeToAnnouncements,
} from "../services/firebaseService";

export default function EventDetails() {
  const { eventId } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      const data = await getEvent(eventId);
      setEvent(data);
      setLoading(false);
    }

    loadEvent();

    const unsubscribeRSVPs =
      subscribeToEventRSVPs(eventId, setRsvps);

    const unsubscribeAnnouncements =
      subscribeToAnnouncements(eventId, setAnnouncements);

    return () => {
      unsubscribeRSVPs();
      unsubscribeAnnouncements();
    };
  }, [eventId]);

  if (loading) {
    return <Loading />;
  }

  if (!event) {
    return (
      <main className="page-container">
        <div className="empty-state">
          <h2>Event not found</h2>
          <Link to="/dashboard">Back to events</Link>
        </div>
      </main>
    );
  }

  const myRSVP = rsvps.find(
    (rsvp) => rsvp.userId === user.uid
  );

  return (
    <main className="page-container">
      <Link to="/dashboard" className="back-link">
        <ArrowLeft size={17} />
        Back to events
      </Link>

      <div className="details-layout">
        <section className="details-main">
          <span className="event-badge">
            {event.eventType}
          </span>

          <h1>{event.eventName}</h1>

          <p className="large-description">
            {event.description}
          </p>

          <div className="details-meta">
            <div>
              <Calendar size={20} />
              <span>
                <strong>Date</strong>
                {event.eventDate}
              </span>
            </div>

            <div>
              <Clock size={20} />
              <span>
                <strong>Time</strong>
                {event.startTime} - {event.endTime || "Flexible"}
              </span>
            </div>

            <div>
              <MapPin size={20} />
              <span>
                <strong>Venue</strong>
                {event.venue || "Online"}
              </span>
            </div>

            <div>
              <Users size={20} />
              <span>
                <strong>Capacity</strong>
                {event.goingCount || 0} / {event.maximumCapacity}
              </span>
            </div>
          </div>

          <RSVPButton
            event={event}
            userId={user.uid}
            currentStatus={myRSVP?.status}
          />

          <section className="announcement-section">
            <h2>Announcements</h2>

            {announcements.length === 0 ? (
              <p className="muted">
                No announcements yet.
              </p>
            ) : (
              announcements.map((announcement) => (
                <div
                  className="announcement"
                  key={announcement.id}
                >
                  <h3>{announcement.title}</h3>
                  <p>{announcement.message}</p>
                </div>
              ))
            )}
          </section>
        </section>

        <aside className="details-sidebar">
          <div className="stat-card">
            <span>Going</span>
            <strong>{event.goingCount || 0}</strong>
          </div>

          <div className="stat-card">
            <span>Maybe</span>
            <strong>{event.maybeCount || 0}</strong>
          </div>

          <div className="stat-card">
            <span>Available seats</span>
            <strong>
              {Math.max(
                0,
                event.maximumCapacity -
                  (event.goingCount || 0)
              )}
            </strong>
          </div>

          <div className="live-indicator">
            <span />
            Live updates enabled
          </div>
        </aside>
      </div>
    </main>
  );
}