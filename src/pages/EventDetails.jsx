import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Radio,
  Megaphone,
  Copy,
  Check,
  UserCheck,
  Pencil,
  XCircle,
  Save,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import RSVPButton from "../components/RSVPButton";
import Loading from "../components/Loading";

import {
  getEvent,
  subscribeToEvent,
  subscribeToEventRSVPs,
  subscribeToAnnouncements,
  subscribeToEventAttendees,
  updateCheckIn,
  createAnnouncement,
  updateEvent,
} from "../services/firebaseService";

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { user, profile } = useAuth();

  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [qrCode, setQrCode] = useState("");
  const [copied, setCopied] = useState(false);

  const [announcementTitle, setAnnouncementTitle] =
    useState("");

  const [announcementMessage, setAnnouncementMessage] =
    useState("");

  const [publishingAnnouncement, setPublishingAnnouncement] =
    useState(false);

  /* =========================
     EDIT EVENT
  ========================= */

  const [editing, setEditing] = useState(false);

  const [editForm, setEditForm] = useState({
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

  const [savingEvent, setSavingEvent] = useState(false);
  const [editError, setEditError] = useState("");

  const [cancellingEvent, setCancellingEvent] =
    useState(false);

  /* =========================
     LOAD EVENT
  ========================= */

  useEffect(() => {
    let unsubscribeEvent = () => {};
    let unsubscribeRSVPs = () => {};
    let unsubscribeAnnouncements = () => {};
    let unsubscribeAttendees = () => {};

    async function loadEvent() {
      try {
        const data = await getEvent(eventId);

        setEvent(data);

        unsubscribeEvent = subscribeToEvent(
          eventId,
          (updatedEvent) => {
            setEvent(updatedEvent);
          }
        );

        unsubscribeRSVPs = subscribeToEventRSVPs(
          eventId,
          setRsvps
        );

        unsubscribeAttendees =
          subscribeToEventAttendees(
            eventId,
            setAttendees
          );

        unsubscribeAnnouncements =
          subscribeToAnnouncements(
            eventId,
            setAnnouncements
          );
      } catch (error) {
        console.error(
          "Failed to load event:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();

    return () => {
      unsubscribeEvent();
      unsubscribeRSVPs();
      unsubscribeAttendees();
      unsubscribeAnnouncements();
    };
  }, [eventId]);

  /* =========================
     QR CODE
  ========================= */

  useEffect(() => {
    async function generateQR() {
      const inviteUrl =
        `${window.location.origin}/events/${eventId}`;

      try {
        const qr = await QRCode.toDataURL(
          inviteUrl,
          {
            width: 220,
            margin: 2,
          }
        );

        setQrCode(qr);
      } catch (error) {
        console.error(
          "QR generation error:",
          error
        );
      }
    }

    generateQR();
  }, [eventId]);

  /* =========================
     COPY INVITE LINK
  ========================= */

  const copyInviteLink = async () => {
    const inviteUrl =
      `${window.location.origin}/events/${eventId}`;

    try {
      await navigator.clipboard.writeText(
        inviteUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy invite link error:",
        error
      );
    }
  };

  /* =========================
     EDIT EVENT
  ========================= */

  const startEditing = () => {
    setEditForm({
      eventName: event.eventName || "",
      description: event.description || "",
      eventType: event.eventType || "Conference",
      eventDate: event.eventDate || "",
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      venue: event.venue || "",
      maximumCapacity:
        event.maximumCapacity || "",
      registrationDeadline:
        event.registrationDeadline || "",
    });

    setEditError("");
    setEditing(true);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();

    if (!editForm.eventName.trim()) {
      setEditError("Event name is required.");
      return;
    }

    if (!editForm.eventDate) {
      setEditError("Event date is required.");
      return;
    }

    if (!editForm.startTime) {
      setEditError("Start time is required.");
      return;
    }

    if (!editForm.venue.trim()) {
      setEditError("Venue is required.");
      return;
    }

    const newCapacity =
      Number(editForm.maximumCapacity);

    if (!newCapacity || newCapacity < 1) {
      setEditError(
        "Maximum capacity must be at least 1."
      );
      return;
    }

    if (
      newCapacity <
      (event.goingCount || 0)
    ) {
      setEditError(
        `Capacity cannot be lower than the current Going count (${event.goingCount || 0}).`
      );
      return;
    }

    try {
      setSavingEvent(true);
      setEditError("");

      await updateEvent(event.id, {
        eventName:
          editForm.eventName.trim(),

        description:
          editForm.description.trim(),

        eventType:
          editForm.eventType,

        eventDate:
          editForm.eventDate,

        startTime:
          editForm.startTime,

        endTime:
          editForm.endTime,

        venue:
          editForm.venue.trim(),

        maximumCapacity:
          newCapacity,

        registrationDeadline:
          editForm.registrationDeadline,
      });

      setEditing(false);
    } catch (error) {
      console.error(
        "Update event error:",
        error
      );

      setEditError(
        error.message ||
          "Failed to update event."
      );
    } finally {
      setSavingEvent(false);
    }
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditError("");
  };

  /* =========================
     CANCEL EVENT
  ========================= */

  const handleCancelEvent = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this event? Attendees will see that the event has been cancelled."
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingEvent(true);

      await updateEvent(event.id, {
        status: "CANCELLED",
      });
    } catch (error) {
      console.error(
        "Cancel event error:",
        error
      );

      alert(
        error.message ||
          "Failed to cancel event."
      );
    } finally {
      setCancellingEvent(false);
    }
  };

  /* =========================
     ANNOUNCEMENT
  ========================= */

  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();

    if (
      !announcementTitle.trim() ||
      !announcementMessage.trim()
    ) {
      return;
    }

    try {
      setPublishingAnnouncement(true);

      await createAnnouncement({
        eventId: event.id,
        title: announcementTitle.trim(),
        message:
          announcementMessage.trim(),
      });

      setAnnouncementTitle("");
      setAnnouncementMessage("");
    } catch (error) {
      console.error(
        "Announcement creation error:",
        error
      );

      alert(
        error.message ||
          "Failed to publish announcement."
      );
    } finally {
      setPublishingAnnouncement(false);
    }
  };

  /* =========================
     CHECK-IN
  ========================= */

  const handleCheckIn = async (attendee) => {
    try {
      await updateCheckIn({
        eventId: event.id,
        userId: attendee.userId,
        checkedIn: !attendee.checkedIn,
      });
    } catch (error) {
      console.error(
        "Check-in error:",
        error
      );

      alert(error.message);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <Loading />;
  }

  if (!event) {
    return (
      <main className="page-container">
        <div className="empty-state">
          <h2>Event not found</h2>

          <p>
            This event may have been deleted.
          </p>

          <Link
            to="/dashboard"
            className="primary-button"
          >
            Back to events
          </Link>
        </div>
      </main>
    );
  }

  /* =========================
     CALCULATIONS
  ========================= */

  const myRSVP = rsvps.find(
    (rsvp) =>
      rsvp.userId === user?.uid
  );

  const availableSeats =
    Math.max(
      0,
      (event.maximumCapacity || 0) -
        (event.goingCount || 0)
    );

  const percentageFilled =
    event.maximumCapacity
      ? Math.min(
          100,
          ((event.goingCount || 0) /
            event.maximumCapacity) *
            100
        )
      : 0;

  const checkedInCount =
    attendees.filter(
      (attendee) =>
        attendee.checkedIn
    ).length;

  const attendanceRate =
    event.goingCount
      ? Math.round(
          (checkedInCount /
            event.goingCount) *
            100
        )
      : 0;

  const isOrganizer =
    event.organizerId === user?.uid ||
    profile?.role === "organizer";

  const isCancelled =
    event.status === "CANCELLED";

  return (
    <div className="event-details-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="event-details-navbar">

        <Link
          to="/dashboard"
          className="brand"
          style={{
            textDecoration: "none",
          }}
        >
          <div className="brand-icon">
            ✦
          </div>

          <span>
            Live Event Platform
          </span>
        </Link>

        <Link
          to="/dashboard"
          className="secondary-button"
          style={{
            textDecoration: "none",
          }}
        >
          Dashboard
        </Link>

      </header>

      <main className="event-details-container">

        <Link
          to="/dashboard"
          className="event-details-back"
          style={{
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={17} />
          Back to events
        </Link>

        {/* =========================
            EVENT HEADER
        ========================= */}

        <section className="event-details-hero">

          <div className="event-details-hero-top">

            <span className="event-type">
              {event.eventType ||
                "Event"}
            </span>

            <span className="event-status">
              {event.status ||
                "PUBLISHED"}
            </span>

          </div>

          <h1>
            {event.eventName}
          </h1>

          {event.description && (
            <p className="event-details-description">
              {event.description}
            </p>
          )}

          {/* =========================
              ORGANIZER ACTIONS
          ========================= */}

          {isOrganizer && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
                flexWrap: "wrap",
              }}
            >

              {!isCancelled && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={startEditing}
                  disabled={editing}
                >
                  <Pencil size={17} />
                  Edit Event
                </button>
              )}

              {!isCancelled && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    handleCancelEvent
                  }
                  disabled={
                    cancellingEvent
                  }
                  style={{
                    color: "#dc2626",
                  }}
                >
                  <XCircle size={17} />

                  {cancellingEvent
                    ? "Cancelling..."
                    : "Cancel Event"}
                </button>
              )}

            </div>
          )}

        </section>

        {/* =========================
            EDIT EVENT FORM
        ========================= */}

        {editing && isOrganizer && (
          <section
            className="event-details-card"
            style={{
              marginBottom: "24px",
            }}
          >

            <div className="section-title-row">

              <div>
                <h2>
                  Edit Event
                </h2>

                <p className="card-subtitle">
                  Update the event information.
                </p>
              </div>

              <Pencil size={19} />

            </div>

            {editError && (
              <div
                className="error-message"
                style={{
                  marginBottom: "16px",
                }}
              >
                {editError}
              </div>
            )}

            <form
              onSubmit={
                handleSaveEvent
              }
              className="event-form"
            >

              <div className="form-section">

                <h2>
                  Basic Information
                </h2>

                <div className="form-group">

                  <label>
                    Event Name *
                  </label>

                  <input
                    type="text"
                    name="eventName"
                    value={
                      editForm.eventName
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

                <div className="form-group">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      editForm.description
                    }
                    onChange={
                      handleEditChange
                    }
                    rows="4"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Event Type
                  </label>

                  <select
                    name="eventType"
                    value={
                      editForm.eventType
                    }
                    onChange={
                      handleEditChange
                    }
                  >
                    <option>
                      Conference
                    </option>

                    <option>
                      Workshop
                    </option>

                    <option>
                      Meetup
                    </option>

                    <option>
                      Seminar
                    </option>

                    <option>
                      College Event
                    </option>

                    <option>
                      Other
                    </option>
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

                    <label>
                      Event Date *
                    </label>

                    <input
                      type="date"
                      name="eventDate"
                      value={
                        editForm.eventDate
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Start Time *
                    </label>

                    <input
                      type="time"
                      name="startTime"
                      value={
                        editForm.startTime
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      End Time
                    </label>

                    <input
                      type="time"
                      name="endTime"
                      value={
                        editForm.endTime
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Registration Deadline
                    </label>

                    <input
                      type="date"
                      name="registrationDeadline"
                      value={
                        editForm.registrationDeadline
                      }
                      onChange={
                        handleEditChange
                      }
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

                  <label>
                    Venue *
                  </label>

                  <input
                    type="text"
                    name="venue"
                    value={
                      editForm.venue
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                </div>

              </div>

              <div className="form-section">

                <h2>
                  <Users size={20} />
                  Capacity
                </h2>

                <div className="form-group">

                  <label>
                    Maximum Capacity *
                  </label>

                  <input
                    type="number"
                    name="maximumCapacity"
                    value={
                      editForm.maximumCapacity
                    }
                    onChange={
                      handleEditChange
                    }
                    min="1"
                  />

                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    cancelEditing
                  }
                  disabled={
                    savingEvent
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    savingEvent
                  }
                >
                  <Save size={17} />

                  {savingEvent
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </section>
        )}

        <div className="event-details-grid">

          <section>

            {/* =========================
                EVENT INFORMATION
            ========================= */}

            <div className="event-details-card">

              <h2>
                Event Information
              </h2>

              <div className="event-meta-list">

                <div className="event-meta-item">

                  <Calendar size={20} />

                  <div>
                    <strong>
                      Date
                    </strong>

                    <span>
                      {event.eventDate}
                    </span>
                  </div>

                </div>

                <div className="event-meta-item">

                  <Clock size={20} />

                  <div>

                    <strong>
                      Time
                    </strong>

                    <span>
                      {event.startTime}

                      {event.endTime
                        ? ` - ${event.endTime}`
                        : ""}
                    </span>

                  </div>

                </div>

                <div className="event-meta-item">

                  <MapPin size={20} />

                  <div>

                    <strong>
                      Venue
                    </strong>

                    <span>
                      {event.venue ||
                        "Online"}
                    </span>

                  </div>

                </div>

                <div className="event-meta-item">

                  <Users size={20} />

                  <div>

                    <strong>
                      Capacity
                    </strong>

                    <span>
                      {event.goingCount ||
                        0}{" "}
                      /{" "}
                      {event.maximumCapacity ||
                        0}{" "}
                      attendees
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* =========================
                RSVP
            ========================= */}

            {!isCancelled && (
              <div className="event-details-card rsvp-main-card">

                <h2>
                  Your RSVP
                </h2>

                <p className="rsvp-card-description">
                  Choose your attendance status.
                  Your response updates the event
                  in real time.
                </p>

                <RSVPButton
                  event={event}
                  userId={user.uid}
                  currentStatus={
                    myRSVP?.status
                  }
                />

              </div>
            )}

            {/* =========================
                INVITE + QR
            ========================= */}

            <div className="event-details-card invite-card">

              <div className="section-title-row">

                <div>

                  <h2>
                    Invite Attendees
                  </h2>

                  <p className="card-subtitle">
                    Share this link or QR code
                    with your invitees.
                  </p>

                </div>

              </div>

              <div className="invite-content">

                <div className="invite-link-area">

                  <label>
                    Unique Event Link
                  </label>

                  <div className="invite-link-box">

                    <input
                      value={`${window.location.origin}/events/${eventId}`}
                      readOnly
                    />

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={
                        copyInviteLink
                      }
                    >

                      {copied ? (
                        <>
                          <Check size={16} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}

                    </button>

                  </div>

                </div>

                {qrCode && (
                  <div className="qr-area">

                    <img
                      src={qrCode}
                      alt="Event QR Code"
                    />

                    <span>
                      Scan to RSVP
                    </span>

                  </div>
                )}

              </div>

            </div>

            {/* =========================
                ANNOUNCEMENTS
            ========================= */}

            <div className="event-details-card announcement-section">

              <div className="section-title-row">

                <div>

                  <h2>
                    Announcements
                  </h2>

                  <p className="card-subtitle">
                    Keep attendees updated with
                    important event information.
                  </p>

                </div>

                <Megaphone size={19} />

              </div>

              {isOrganizer && (
                <form
                  className="announcement-form"
                  onSubmit={
                    handlePublishAnnouncement
                  }
                >

                  <input
                    type="text"
                    placeholder="Announcement title"
                    value={
                      announcementTitle
                    }
                    onChange={(e) =>
                      setAnnouncementTitle(
                        e.target.value
                      )
                    }
                    required
                  />

                  <textarea
                    placeholder="Write an announcement for attendees..."
                    rows="3"
                    value={
                      announcementMessage
                    }
                    onChange={(e) =>
                      setAnnouncementMessage(
                        e.target.value
                      )
                    }
                    required
                  />

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      publishingAnnouncement
                    }
                  >

                    <Megaphone size={17} />

                    {publishingAnnouncement
                      ? "Publishing..."
                      : "Publish Announcement"}

                  </button>

                </form>
              )}

              {announcements.length === 0 ? (
                <div className="announcement-empty">

                  <p>
                    No announcements yet.
                  </p>

                </div>
              ) : (
                <div className="announcement-list">

                  {announcements.map(
                    (announcement) => (

                      <div
                        className="announcement"
                        key={
                          announcement.id
                        }
                      >

                        <h3>
                          {
                            announcement.title
                          }
                        </h3>

                        <p>
                          {
                            announcement.message
                          }
                        </p>

                      </div>

                    )
                  )}

                </div>
              )}

            </div>

            {/* =========================
                CHECK-IN
            ========================= */}

            {isOrganizer && (
              <div className="event-details-card checkin-section">

                <div className="section-title-row">

                  <div>

                    <h2>
                      Attendee Check-in
                    </h2>

                    <p className="card-subtitle">
                      {checkedInCount} of{" "}
                      {attendees.length}{" "}
                      attendees checked in.
                    </p>

                  </div>

                  <UserCheck size={21} />

                </div>

                {attendees.length === 0 ? (
                  <div className="announcement-empty">

                    <p>
                      No RSVP responses yet.
                    </p>

                  </div>
                ) : (
                  <div className="attendee-list">

                    {attendees.map(
                      (attendee) => (

                        <div
                          className="attendee-row"
                          key={
                            attendee.id
                          }
                        >

                          <div className="attendee-info">

                            <strong>
                              {
                                attendee.userName ||
                                "Attendee"
                              }
                            </strong>

                            <span>
                              {
                                attendee.userEmail
                              }
                            </span>

                            <small
                              className={`attendee-status ${attendee.status?.toLowerCase()}`}
                            >
                              {
                                attendee.status
                              }
                            </small>

                          </div>

                          <button
                            type="button"
                            className={
                              attendee.checkedIn
                                ? "checkin-button checked"
                                : "checkin-button"
                            }
                            onClick={() =>
                              handleCheckIn(
                                attendee
                              )
                            }
                          >

                            <UserCheck size={16} />

                            {attendee.checkedIn
                              ? "Checked In"
                              : "Check In"}

                          </button>

                        </div>

                      )
                    )}

                  </div>
                )}

              </div>
            )}

            {/* =========================
                ORGANIZER ANALYTICS
            ========================= */}

            {isOrganizer && (
              <div className="event-details-card">

                <div className="section-title-row">

                  <div>

                    <h2>
                      Event Analytics
                    </h2>

                    <p className="card-subtitle">
                      Real-time attendance and
                      RSVP statistics.
                    </p>

                  </div>

                  <Users size={21} />

                </div>

                <div className="rsvp-counts">

                  <div className="rsvp-count">

                    <strong>
                      {rsvps.length}
                    </strong>

                    <span>
                      Total RSVPs
                    </span>

                  </div>

                  <div className="rsvp-count">

                    <strong>
                      {event.goingCount || 0}
                    </strong>

                    <span>
                      Going
                    </span>

                  </div>

                  <div className="rsvp-count">

                    <strong>
                      {event.maybeCount || 0}
                    </strong>

                    <span>
                      Maybe
                    </span>

                  </div>

                  <div className="rsvp-count">

                    <strong>
                      {event.notGoingCount || 0}
                    </strong>

                    <span>
                      Not Going
                    </span>

                  </div>

                </div>

                <div className="capacity-box">

                  <div className="capacity-header">

                    <span>
                      Capacity utilization
                    </span>

                    <strong>
                      {Math.round(
                        percentageFilled
                      )}
                      %
                    </strong>

                  </div>

                  <div className="capacity-bar">

                    <div
                      className="capacity-progress"
                      style={{
                        width:
                          `${percentageFilled}%`,
                      }}
                    />

                  </div>

                  <small>
                    {event.goingCount || 0}{" "}
                    of{" "}
                    {event.maximumCapacity ||
                      0}{" "}
                    seats occupied
                  </small>

                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "12px",
                    marginTop: "18px",
                  }}
                >

                  <div className="announcement">

                    <h3>
                      Checked In
                    </h3>

                    <p>
                      {checkedInCount}
                    </p>

                  </div>

                  <div className="announcement">

                    <h3>
                      Remaining Seats
                    </h3>

                    <p>
                      {availableSeats}
                    </p>

                  </div>

                  <div className="announcement">

                    <h3>
                      Attendance Rate
                    </h3>

                    <p>
                      {attendanceRate}%
                    </p>

                  </div>

                </div>

              </div>
            )}

          </section>

          {/* =========================
              LIVE SIDEBAR
          ========================= */}

          <aside>

            <div className="event-details-card rsvp-card">

              <div className="sidebar-heading">

                <h2>
                  Live Attendance
                </h2>

                <div className="live-badge">

                  <Radio size={13} />

                  LIVE

                </div>

              </div>

              <div className="rsvp-counts">

                <div className="rsvp-count">

                  <strong>
                    {event.goingCount ||
                      0}
                  </strong>

                  <span>
                    Going
                  </span>

                </div>

                <div className="rsvp-count">

                  <strong>
                    {event.maybeCount ||
                      0}
                  </strong>

                  <span>
                    Maybe
                  </span>

                </div>

                <div className="rsvp-count">

                  <strong>
                    {event.notGoingCount ||
                      0}
                  </strong>

                  <span>
                    Not Going
                  </span>

                </div>

              </div>

              <div className="capacity-box">

                <div className="capacity-header">

                  <span>
                    Available seats
                  </span>

                  <strong>
                    {availableSeats}
                  </strong>

                </div>

                <div className="capacity-bar">

                  <div
                    className="capacity-progress"
                    style={{
                      width:
                        `${percentageFilled}%`,
                    }}
                  />

                </div>

                <small>
                  {event.goingCount ||
                    0}{" "}
                  of{" "}
                  {event.maximumCapacity ||
                    0}{" "}
                  seats filled
                </small>

              </div>

              <div className="live-indicator">

                <span />

                Live updates enabled

              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}