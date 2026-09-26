import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

/* =========================
   EVENT
========================= */

export async function getEvent(eventId) {
  const eventRef = doc(db, "events", eventId);
  const snapshot = await getDoc(eventRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/* =========================
   RSVP
========================= */

export async function getUserRSVP(eventId, userId) {
  const rsvpRef = doc(
    db,
    "events",
    eventId,
    "rsvps",
    userId
  );

  const snapshot = await getDoc(rsvpRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function submitRSVP({
  eventId,
  userId,
  userName,
  userEmail,
  status,
}) {
  const eventRef = doc(db, "events", eventId);
  const rsvpRef = doc(
    db,
    "events",
    eventId,
    "rsvps",
    userId
  );

  await runTransaction(db, async (transaction) => {
    const eventSnapshot = await transaction.get(eventRef);
    const rsvpSnapshot = await transaction.get(rsvpRef);

    if (!eventSnapshot.exists()) {
      throw new Error("Event not found.");
    }

    const event = eventSnapshot.data();

    const oldStatus = rsvpSnapshot.exists()
      ? rsvpSnapshot.data().status
      : null;

    if (oldStatus === status) {
      return;
    }

    const updates = {};

    if (oldStatus === "GOING") {
      updates.goingCount = increment(-1);
    }

    if (oldStatus === "MAYBE") {
      updates.maybeCount = increment(-1);
    }

    if (oldStatus === "NOT_GOING") {
      updates.notGoingCount = increment(-1);
    }

    if (status === "GOING") {
      const currentGoing = event.goingCount || 0;
      const capacity = event.maximumCapacity || 0;

      if (currentGoing >= capacity && oldStatus !== "GOING") {
        throw new Error(
          "This event is full. No more Going RSVPs are available."
        );
      }

      updates.goingCount = increment(1);
    }

    if (status === "MAYBE") {
      updates.maybeCount = increment(1);
    }

    if (status === "NOT_GOING") {
      updates.notGoingCount = increment(1);
    }

    transaction.set(
      rsvpRef,
      {
        userId,
        userName,
        userEmail,
        status,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    transaction.update(eventRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  });
}

/* =========================
   REAL-TIME RSVP LIST
========================= */

export function subscribeToEventRSVPs(
  eventId,
  callback
) {
  const rsvpsRef = collection(
    db,
    "events",
    eventId,
    "rsvps"
  );

  const rsvpsQuery = query(
    rsvpsRef,
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(
    rsvpsQuery,
    (snapshot) => {
      const rsvps = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      callback(rsvps);
    },
    (error) => {
      console.error("RSVP listener error:", error);
      callback([]);
    }
  );
}

/* =========================
   REAL-TIME EVENT
========================= */

export function subscribeToEvent(
  eventId,
  callback
) {
  const eventRef = doc(db, "events", eventId);

  return onSnapshot(
    eventRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snapshot.id,
        ...snapshot.data(),
      });
    },
    (error) => {
      console.error("Event listener error:", error);
    }
  );
}

/* =========================
   ANNOUNCEMENTS
========================= */

export function subscribeToAnnouncements(
  eventId,
  callback
) {
  const announcementsRef = collection(
    db,
    "events",
    eventId,
    "announcements"
  );

  const announcementsQuery = query(
    announcementsRef,
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    announcementsQuery,
    (snapshot) => {
      const announcements = snapshot.docs.map(
        (item) => ({
          id: item.id,
          ...item.data(),
        })
      );

      callback(announcements);
    },
    (error) => {
      console.error(
        "Announcement listener error:",
        error
      );

      callback([]);
    }
  );
}

export async function createAnnouncement({
  eventId,
  title,
  message,
}) {
  const announcementsRef = collection(
    db,
    "events",
    eventId,
    "announcements"
  );

  await addDoc(announcementsRef, {
    title,
    message,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToEventAttendees(
  eventId,
  callback
) {
  const rsvpsRef = collection(
    db,
    "events",
    eventId,
    "rsvps"
  );

  const rsvpsQuery = query(
    rsvpsRef,
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(
    rsvpsQuery,
    (snapshot) => {
      const attendees = snapshot.docs.map(
        (item) => ({
          id: item.id,
          ...item.data(),
        })
      );

      callback(attendees);
    },
    (error) => {
      console.error(
        "Attendee listener error:",
        error
      );

      callback([]);
    }
  );
}

export async function updateCheckIn({
  eventId,
  userId,
  checkedIn,
}) {
  const rsvpRef = doc(
    db,
    "events",
    eventId,
    "rsvps",
    userId
  );

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(rsvpRef);

    if (!snapshot.exists()) {
      throw new Error("RSVP not found.");
    }

    transaction.update(rsvpRef, {
      checkedIn,
      checkedInAt: checkedIn
        ? serverTimestamp()
        : null,
    });
  });
}