import { useState } from "react";
import {
  Check,
  HelpCircle,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { submitRSVP } from "../services/firebaseService";

export default function RSVPButton({
  event,
  userId,
  currentStatus,
}) {
  const { user, profile } = useAuth();

  const [status, setStatus] = useState(
    currentStatus || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleRSVP = async (newStatus) => {
    if (!userId || !user) {
      setError("Please log in to RSVP.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await submitRSVP({
        eventId: event.id,
        userId,
        userName:
          profile?.name ||
          user.displayName ||
          "Attendee",
        userEmail: user.email || "",
        status: newStatus,
      });

      setStatus(newStatus);
    } catch (err) {
      console.error("RSVP error:", err);

      setError(
        err.message ||
          "Unable to update your RSVP."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rsvp-control">
      <div className="rsvp-buttons">
        <button
          type="button"
          className={`rsvp-button going ${
            status === "GOING" ? "active" : ""
          }`}
          onClick={() => handleRSVP("GOING")}
          disabled={saving}
        >
          <Check size={18} />
          Going
        </button>

        <button
          type="button"
          className={`rsvp-button maybe ${
            status === "MAYBE" ? "active" : ""
          }`}
          onClick={() => handleRSVP("MAYBE")}
          disabled={saving}
        >
          <HelpCircle size={18} />
          Maybe
        </button>

        <button
          type="button"
          className={`rsvp-button not-going ${
            status === "NOT_GOING"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleRSVP("NOT_GOING")
          }
          disabled={saving}
        >
          <X size={18} />
          Not Going
        </button>
      </div>

      {saving && (
        <p className="rsvp-saving">
          Updating your RSVP...
        </p>
      )}

      {error && (
        <div className="error-message rsvp-error">
          {error}
        </div>
      )}

      {status && !saving && !error && (
        <p className="rsvp-success">
          Your response:{" "}
          <strong>
            {status === "GOING"
              ? "Going"
              : status === "MAYBE"
              ? "Maybe"
              : "Not Going"}
          </strong>
        </p>
      )}
    </div>
  );
}