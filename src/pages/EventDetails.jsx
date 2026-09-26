import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
} from "../services/firebaseService";

export default function EventDetails() {
  const { eventId } = useParams();
  const { user, profile } = useAuth();

  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [qrCode, setQrCode] = useState("");
  const [copied, setCopied] = useState(false);

  const [announcementTitle, setAnnouncementTitle] = useState("");
const [announcementMessage, setAnnouncementMessage] = useState("");

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

  const copyInviteLink = async () => {
    const inviteUrl =
      `${window.location.origin}/events/${eventId}`;

    await navigator.clipboard.writeText(inviteUrl);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleCheckIn = async (
    attendee
  ) => {
    try {
      await updateCheckIn({
        eventId,
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

  const myRSVP = rsvps.find(
    (rsvp) =>
      rsvp.userId === user?.uid
  );

  const availableSeats = Math.max(
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
      (attendee) => attendee.checkedIn
    ).length;

  const isOrganizer =
    event.organizerId === user?.uid ||
    profile?.role === "organizer";

  return (
    <div className="event-details-page">
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

        {/* EVENT HEADER */}

        <section className="event-details-hero">
          <div className="event-details-hero-top">
            <span className="event-type">
              {event.eventType || "Event"}
            </span>

            <span className="event-status">
              {event.status ||
                "PUBLISHED"}
            </span>
          </div>

          <h1>{event.eventName}</h1>

          {event.description && (
            <p className="event-details-description">
              {event.description}
            </p>
          )}
        </section>

        <div className="event-details-grid">
          <section>
            {/* EVENT INFORMATION */}

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
                        0} attendees
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RSVP */}

            <div className="event-details-card rsvp-main-card">
              <h2>Your RSVP</h2>

              <p className="rsvp-card-description">
                Choose your attendance
                status. Your response
                updates the event in real
                time.
              </p>

              <RSVPButton
                event={event}
                userId={user.uid}
                currentStatus={
                  myRSVP?.status
                }
              />
            </div>

            {/* INVITE + QR */}

            <div className="event-details-card invite-card">
              <div className="section-title-row">
                <div>
                  <h2>
                    Invite Attendees
                  </h2>

                  <p className="card-subtitle">
                    Share this link or QR
                    code with your
                    invitees.
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
                          <Check
                            size={16}
                          />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy
                            size={16}
                          />
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

            {/* ANNOUNCEMENTS */}
        {isOrganizer && (
          
        
            <div className="event-details-card announcement-section">
              <div className="section-title-row">
                <h2>
                  Announcements
                </h2>

                <Megaphone size={19} />
              </div>

              {announcements.length ===
              0 ? (
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
            )}

            {/* CHECK-IN */}

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

                {attendees.length ===
                0 ? (
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
                          key={attendee.id}
                        >
                          <div className="attendee-info">
                            <strong>
                              {attendee.userName ||
                                "Attendee"}
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
                            <UserCheck
                              size={16}
                            />

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
          </section>{/* ANNOUNCEMENTS */}
          
<div className="event-details-card announcement-section">
  <div className="section-title-row">
    <div>
      <h2>Announcements</h2>
      <p className="card-subtitle">
        Keep attendees updated with important event information.
      </p>
    </div>

    <Megaphone size={19} />
  </div>

  {isOrganizer && (
    <form
      className="announcement-form"
      onSubmit={async (e) => {
        e.preventDefault();

        if (!announcementTitle.trim() || !announcementMessage.trim()) {
          return;
        }

        try {
          await createAnnouncement({
            eventId: event.id,
            title: announcementTitle.trim(),
            message: announcementMessage.trim(),
          });

          setAnnouncementTitle("");
          setAnnouncementMessage("");
        } catch (error) {
          console.error(
            "Announcement creation error:",
            error
          );
        }
      }}
    >
      <input
        type="text"
        placeholder="Announcement title"
        value={announcementTitle}
        onChange={(e) =>
          setAnnouncementTitle(e.target.value)
        }
      />

      <textarea
        placeholder="Write an announcement for attendees..."
        rows="3"
        value={announcementMessage}
        onChange={(e) =>
          setAnnouncementMessage(e.target.value)
        }
      />

      <button
        type="submit"
        className="primary-button"
      >
        <Megaphone size={17} />
        Publish Announcement
      </button>
    </form>
  )}

  {announcements.length === 0 ? (
    <div className="announcement-empty">
      <p>No announcements yet.</p>
    </div>
  ) : (
    <div className="announcement-list">
      {announcements.map((announcement) => (
        <div
          className="announcement"
          key={announcement.id}
        >
          <h3>{announcement.title}</h3>

          <p>{announcement.message}</p>
        </div>
      ))}
    </div>
  )}
</div>

          {/* LIVE SIDEBAR */}

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

                  <span>Going</span>
                </div>

                <div className="rsvp-count">
                  <strong>
                    {event.maybeCount ||
                      0}
                  </strong>

                  <span>Maybe</span>
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
                      width: `${percentageFilled}%`,
                    }}
                  />
                </div>

                <small>
                  {event.goingCount ||
                    0}{" "}
                  of{" "}
                  {event.maximumCapacity ||
                    0} seats filled
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