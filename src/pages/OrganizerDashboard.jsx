import { useEffect, useState } from "react";
import {
  CalendarDays,
  Users,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  subscribeToOrganizerEvents,
} from "../services/firebaseService";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribe =
      subscribeToOrganizerEvents(
        user.uid,
        setEvents
      );

    return unsubscribe;
  }, [user.uid]);

  const totalCapacity = events.reduce(
    (sum, event) => sum + (event.maximumCapacity || 0),
    0
  );

  const totalGoing = events.reduce(
    (sum, event) => sum + (event.goingCount || 0),
    0
  );

  const totalMaybe = events.reduce(
    (sum, event) => sum + (event.maybeCount || 0),
    0
  );

  return (
    <main className="page-container">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Organizer workspace</span>
          <h1>Dashboard</h1>
          <p>Monitor your events and live attendance.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="dashboard-stat">
          <div className="stat-icon">
            <CalendarDays />
          </div>
          <span>Total events</span>
          <strong>{events.length}</strong>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">
            <Users />
          </div>
          <span>Total attendees</span>
          <strong>{totalGoing}</strong>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">
            <CheckCircle2 />
          </div>
          <span>Maybe responses</span>
          <strong>{totalMaybe}</strong>
        </div>

        <div className="dashboard-stat">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <span>Total capacity</span>
          <strong>{totalCapacity}</strong>
        </div>
      </div>

      <section className="dashboard-table">
        <div className="table-header">
          <h2>Your events</h2>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <h3>No events yet</h3>
            <p>Create your first event to start collecting RSVPs.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Going</th>
                  <th>Maybe</th>
                  <th>Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.eventName}</td>
                    <td>{event.eventDate}</td>
                    <td>{event.goingCount || 0}</td>
                    <td>{event.maybeCount || 0}</td>
                    <td>{event.maximumCapacity}</td>
                    <td>
                      <span className="status-pill">
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}