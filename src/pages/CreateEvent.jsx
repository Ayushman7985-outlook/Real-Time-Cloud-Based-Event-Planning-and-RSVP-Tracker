import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [form, setForm] = useState({
    eventName: "",
    description: "",
    eventType: "Conference",
    eventDate: "",
    startTime: "",
    endTime: "",
    venue: "",
    maximumCapacity: "",
    registrationDeadline: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (
      !form.eventName ||
      !form.eventDate ||
      !form.startTime ||
      !form.venue ||
      !form.maximumCapacity
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const eventData = {
        eventName: form.eventName,
        description: form.description,
        eventType: form.eventType,

        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime,

        venue: form.venue,

        maximumCapacity: Number(form.maximumCapacity),

        registrationDeadline: form.registrationDeadline,

        organizerId: user.uid,
        organizerName: profile?.name || user.displayName || "Organizer",

        status: "PUBLISHED",

        goingCount: 0,
        maybeCount: 0,
        notGoingCount: 0,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const eventRef = await addDoc(
        collection(db, "events"),
        eventData
      );

      navigate(`/events/${eventRef.id}`);
    } catch (err) {
      console.error("Create event error:", err);
      setError(err.message || "Failed to create event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-page">

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="page-heading">
          <h1>Create Event</h1>
          <p>Create and publish your event for attendees.</p>
        </div>

        <form onSubmit={handleSubmit} className="event-form">

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label>Event Name *</label>
              <input
                type="text"
                name="eventName"
                value={form.eventName}
                onChange={handleChange}
                placeholder="e.g. Tech Meetup 2026"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your event..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Event Type</label>

              <select
                name="eventType"
                value={form.eventType}
                onChange={handleChange}
              >
                <option>Conference</option>
                <option>Workshop</option>
                <option>Meetup</option>
                <option>Seminar</option>
                <option>College Event</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>
              <Calendar size={20} />
              Date & Time
            </h2>

            <div className="form-grid">

              <div className="form-group">
                <label>Event Date *</label>
                <input
                  type="date"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Registration Deadline</label>
                <input
                  type="date"
                  name="registrationDeadline"
                  value={form.registrationDeadline}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>

          <div className="form-section">
            <h2>
              <MapPin size={20} />
              Location
            </h2>

            <div className="form-group">
              <label>Venue *</label>
              <input
                type="text"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="e.g. IIT Delhi Auditorium"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>
              <Users size={20} />
              Capacity
            </h2>

            <div className="form-group">
              <label>Maximum Capacity *</label>
              <input
                type="number"
                name="maximumCapacity"
                value={form.maximumCapacity}
                onChange={handleChange}
                min="1"
                placeholder="100"
              />
            </div>
          </div>

          <div className="form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create Event"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}