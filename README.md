# Real-Time Cloud-Based Event Planning & RSVP Tracker

A cloud-based event planning and RSVP management platform built using **React, Vite, Firebase Authentication, Cloud Firestore, and Vercel**.

The application allows organizers to create and manage events while attendees can discover events, submit RSVPs, receive real-time updates, and check in. The system also demonstrates cloud authentication, real-time database updates, capacity management, concurrency control, analytics, and cloud deployment.

---

## 🚀 Live Application

**Live Demo:**
https://real-time-cloud-based-event-plannin.vercel.app/login

---

## 📌 Problem Statement

Traditional event management often relies on manual registration, spreadsheets, messaging applications, and static attendee lists. These approaches make it difficult to track attendance in real time, manage event capacity, prevent overbooking, and keep attendees updated.

This project provides a centralized cloud-based system for event creation, RSVP management, real-time updates, capacity control, announcements, and attendee check-in.

---

## 🎯 Objectives

* Create and publish events through a cloud-based application.
* Provide secure user authentication.
* Allow attendees to submit and update RSVPs.
* Display RSVP counts in real time.
* Prevent event overbooking.
* Handle concurrent RSVP requests safely.
* Provide QR-based event invitations.
* Allow organizers to check in attendees.
* Provide organizer analytics.
* Deploy the application on the cloud.
* Demonstrate cloud computing and real-time computing concepts.

---

## ✨ Features

### Organizer

* Register and log in.
* Create events.
* Publish events.
* Set event capacity.
* Generate unique event links.
* Generate QR-based invitations.
* View real-time RSVP counts.
* View attendee information.
* Publish announcements.
* Send manual event reminders.
* Check in attendees.
* View attendance analytics.
* Edit/cancel events.

### Attendee

* Register and log in.
* View published events.
* Search events.
* Open event details.
* Submit RSVP:

  * GOING
  * MAYBE
  * NOT GOING
* Change RSVP status.
* View real-time event information.
* Access event through a unique invitation link/QR.

---

## ☁️ Cloud Computing Concepts

The project demonstrates:

* Cloud authentication
* Cloud-hosted application
* Cloud database
* Real-time database updates
* Role-based access control
* Cloud deployment
* Serverless Firebase architecture
* Database security rules
* Concurrency control
* Cloud scalability concepts
* Failure handling

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      User           │
                    │ Organizer /         │
                    │ Attendee            │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + Vite        │
                    │ Frontend            │
                    └──────────┬──────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        Firebase Auth    Cloud Firestore    Vercel
        Authentication   Real-time DB       Deployment
                │              │
                │              │
                └──────────────┘
                       │
                       ▼
              Real-Time Application
```

---

## 🛠️ Technology Stack

| Technology              | Purpose                           |
| ----------------------- | --------------------------------- |
| React                   | Frontend UI                       |
| Vite                    | Frontend development/build tool   |
| JavaScript              | Application logic                 |
| Firebase Authentication | User authentication               |
| Cloud Firestore         | Cloud database                    |
| Firebase Security Rules | Authorization and data protection |
| Lucide React            | UI icons                          |
| Vercel                  | Cloud deployment                  |
| Git & GitHub            | Version control                   |

---

## 👥 User Roles

### Organizer

The organizer can create and manage events, monitor RSVPs, publish announcements, check in attendees, and view analytics.

### Attendee

The attendee can browse published events and manage their RSVP status.

The application uses the user's role stored in Firestore to control organizer-specific interface functionality.

---

# 📅 Event Management

Organizers can create events with:

* Event name
* Description
* Event type
* Date
* Start time
* End time
* Venue
* Maximum capacity
* Registration deadline

Each event is stored in Cloud Firestore.

---

# 🎟️ RSVP System

Attendees can select:

* **GOING**
* **MAYBE**
* **NOT GOING**

An attendee can change their RSVP status later.

The RSVP information is stored under the event's Firestore document.

Example structure:

```text
events
 └── eventId
      └── rsvps
           └── userId
```

---

# ⚡ Real-Time Updates

The application uses Firestore real-time listeners.

When an attendee changes their RSVP:

```text
Attendee
   ↓
Firestore
   ↓
Real-Time Listener
   ↓
Organizer Dashboard
```

The organizer does not need to manually refresh the page to see updated RSVP information.

---

# 🔒 Capacity Management

Every event has a maximum capacity.

For example:

```text
Maximum Capacity = 100
Going = 97
Available Seats = 3
```

The system prevents additional GOING RSVPs when the event reaches its configured capacity.

---

# 🔄 Concurrency Control

Concurrency handling is implemented using Firestore transactions.

The RSVP operation uses:

```javascript
runTransaction()
```

This ensures that the capacity check and RSVP update are performed atomically.

For example, if only one seat remains and two attendees attempt to claim it simultaneously, the transaction mechanism prevents both requests from successfully occupying the final seat.

A concurrency test was performed with simultaneous RSVP requests.

---

# 📱 QR & Unique Invitations

Each event receives a unique event URL.

Example:

```text
/events/{eventId}
```

The event URL can also be represented as a QR code so attendees can quickly open the event page.

---

# 📢 Announcements & Reminders

Organizers can publish announcements for an event.

Announcements are stored in Firestore and displayed to users through real-time listeners.

The project also contains a **manual event reminder** feature.

The current reminder system creates an in-app "Event Reminder" announcement.

### Current limitation

The project does **not** implement:

* Automatic scheduled reminders
* Email reminders
* SMS reminders
* Push notifications
* AI-based smart reminder timing

---

# 📊 Organizer Analytics

The event page provides organizer analytics such as:

* Total capacity
* Going count
* Maybe count
* Not Going count
* Available seats
* Capacity utilization
* Checked-in attendees
* Attendance rate

These values are calculated from the live Firestore event and RSVP data.

---

# 🔐 Authentication

Firebase Authentication is used for:

* User registration
* Login
* Logout
* Authentication state management

Email/password authentication is currently enabled.

---

# 🛡️ Security & Authorization

Cloud Firestore Security Rules are used to control access to data.

The rules restrict:

* User profile access
* Event creation
* Organizer event management
* RSVP updates
* Attendee check-in operations
* Announcement operations

Authenticated users are required for application operations.

Sensitive Firebase credentials are not hard-coded into the repository beyond the client configuration values intended for Firebase web applications.

---

# 🗄️ Database Structure

Main Firestore collections:

```text
users
events
   ├── rsvps
   └── announcements
```

### Users

```text
uid
name
email
role
createdAt
```

### Events

```text
eventName
description
eventType
eventDate
startTime
endTime
venue
maximumCapacity
registrationDeadline
organizerId
organizerName
status
goingCount
maybeCount
notGoingCount
createdAt
updatedAt
```

### RSVP

```text
userId
userName
userEmail
status
checkedIn
checkedInAt
updatedAt
```

---

# 📂 Project Structure

```text
rsvp-tracker/
│
├── src/
│   ├── components/
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CreateEvent.jsx
│   │   └── EventDetails.jsx
│   │
│   ├── services/
│   │   └── firebaseService.jsx
│   │
│   ├── firebase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

---

# ⚙️ Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project directory:

```bash
cd rsvp-tracker
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🔥 Firebase Configuration

Create a Firebase project and enable:

* Firebase Authentication
* Email/Password Authentication
* Cloud Firestore

Add the Firebase web configuration to:

```text
src/firebase.js
```

The configuration contains:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

---

# 🧪 Testing

The following functionality was tested:

* User registration
* User login
* Organizer dashboard
* Attendee dashboard
* Event creation
* Event publishing
* Event details
* RSVP GOING
* RSVP MAYBE
* RSVP NOT GOING
* RSVP status changes
* Real-time RSVP counts
* Multi-user real-time updates
* Event capacity
* Concurrency handling
* Announcements
* Manual reminders
* Attendee check-in
* Analytics
* Logout/login
* Cloud deployment

---

# 🔄 Multi-User Real-Time Test

The application was tested using multiple user sessions.

Example:

```text
Organizer
    │
    │ monitors event
    ▼
Firestore
    ▲
    │
    │ RSVP
    │
Attendee A
    │
Attendee B
```

Changes made by attendees were reflected in the organizer's event page without requiring a manual page refresh.

---

# ⚠️ Current Limitations

The following features are not currently implemented:

* Full automated FIFO waitlist
* Automatic scheduled reminders
* Email/SMS notifications
* Push notifications
* AI attendance prediction
* AI-based smart reminder timing
* Separate FastAPI/Flask backend
* Custom REST API layer
* Advanced administrator role
* Production-scale monitoring

These can be added as future improvements.

---

# 🚀 Cloud Deployment

The frontend is deployed using Vercel.

### Live Application

**https://real-time-cloud-based-event-plannin.vercel.app/login**

The application connects to Firebase Cloud Firestore and Firebase Authentication from the deployed frontend.

---

# 📈 Scalability

The application uses Firebase services that can support scaling without requiring the project to manage its own database server.

Potential future improvements include:

* Pagination
* Advanced indexing
* Cloud Functions
* Automated notification services
* Dedicated backend APIs
* Caching
* Monitoring
* Advanced role management

---

# 🔮 Future Scope

Possible future improvements:

1. Automated email reminders.
2. Push notifications.
3. Automatic waitlist management.
4. AI-based attendance prediction.
5. Smart reminder timing.
6. FastAPI backend.
7. Admin dashboard.
8. Advanced event analytics.
9. Calendar integration.
10. Attendance prediction based on historical data.

---

# 🎓 Learning Outcomes

This project provided practical experience with:

* React development
* Vite
* Firebase Authentication
* Cloud Firestore
* Firestore transactions
* Real-time database listeners
* Cloud security rules
* Role-based access control
* QR-based event invitations
* Cloud deployment
* Git and GitHub
* Concurrency handling
* Real-time application architecture

---

# 📌 Project Summary

**Project:** Real-Time Cloud-Based Event Planning and RSVP Tracker

**Frontend:** React + Vite

**Authentication:** Firebase Authentication

**Database:** Cloud Firestore

**Real-Time Technology:** Firestore real-time listeners

**Cloud Deployment:** Vercel

**Version Control:** Git + GitHub

**Architecture:** Firebase-centric serverless cloud architecture

---

# 🌐 Project Links

### Live Application

https://real-time-cloud-based-event-plannin.vercel.app/login

### GitHub Repository

Add your GitHub repository URL here.

---

# 👨‍💻 Author

**Ayushman Dubey**

B.Tech Information Technology

---

# 📄 License

This project was developed as an educational and academic project for demonstrating cloud computing, real-time systems, authentication, database management, and cloud deployment concepts.
