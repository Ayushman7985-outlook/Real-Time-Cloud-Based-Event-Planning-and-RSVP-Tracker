import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
} from "lucide-react";

export default function EventCard({ event }) {
  const date = event.eventDate
    ? new Date(`${event.eventDate}T00:00:00`)
    : null;

  const percentage = Math.min(
    100,
    ((event.goingCount || 0) / event.maximumCapacity) * 100
  );

  return (
    <article className="event-card">
      <div className="event-card-top">
        <span className="event-badge">
          {event.eventType || "EVENT"}
        </span>

        <span
          className={`status-pill ${
            event.status === "FULL" ? "full" : ""
          }`}
        >
          {event.status}
        </span>
      </div>

      <h3>{event.eventName}</h3>

      <p className="event-description">
        {event.description || "No description provided."}
      </p>

      <div className="event-meta">
        <span>
          <Calendar size={16} />
          {date
            ? date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Date unavailable"}
        </span>

        <span>
          <Clock size={16} />
          {event.startTime}
        </span>

        <span>
          <MapPin size={16} />
          {event.venue || "Online"}
        </span>
      </div>

      <div className="capacity">
        <div className="capacity-label">
          <span>
            <Users size={15} />
            {event.goingCount || 0} attending
          </span>

          <span>
            {event.maximumCapacity} seats
          </span>
        </div>

        <div className="progress">
          <div
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <Link
        to={`/events/${event.id}`}
        className="primary-button full-width"
      >
        View event
      </Link>
    </article>
  );
}