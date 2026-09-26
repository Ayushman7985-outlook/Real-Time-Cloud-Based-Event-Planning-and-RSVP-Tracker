// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASGxcfrHrUCtfZ6eMGjLprscm-GDtAbJM",
  authDomain: "event-rsvp-tracker.firebaseapp.com",
  projectId: "event-rsvp-tracker",
  storageBucket: "event-rsvp-tracker.firebasestorage.app",
  messagingSenderId: "245419791819",
  appId: "1:245419791819:web:9b64353f4f75a1e75d524e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;