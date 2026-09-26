import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);

        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          const snapshot = await getDoc(userRef);

          if (snapshot.exists()) {
            setProfile(snapshot.data());
          } else {
            setProfile({
              uid: currentUser.uid,
              name: currentUser.displayName || "",
              email: currentUser.email || "",
              role: "attendee",
            });
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth/Firestore error:", error);

        // Don't let a Firestore error keep the whole app loading forever.
        setProfile(
          currentUser
            ? {
                uid: currentUser.uid,
                name: currentUser.displayName || "",
                email: currentUser.email || "",
                role: "attendee",
              }
            : null
        );
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const register = async (name, email, password, role) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(credential.user, {
      displayName: name,
    });

    const userData = {
      uid: credential.user.uid,
      name,
      email,
      role,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(
        doc(db, "users", credential.user.uid),
        userData
      );

      setProfile(userData);
    } catch (error) {
      console.error("Failed to save user profile:", error);

      // Authentication succeeded even if Firestore fails.
      setProfile({
        uid: credential.user.uid,
        name,
        email,
        role,
      });
    }

    return credential.user;
  };

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return credential.user;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}