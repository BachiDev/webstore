// src/lib/UserContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth, payments } from "./firebase";
import type { User } from "firebase/auth";
import { getCurrentUserSubscriptions } from "@invertase/firestore-stripe-payments";
import { pickHighestRole } from "./roles";

interface UserContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
}

const UserContext = createContext<UserContextType>({ user: null, loading: true, role: null });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      const loggedOut = localStorage.getItem("logged_out");
      if (authUser) {
        localStorage.removeItem("logged_out");

        try {
          const subscriptions = await getCurrentUserSubscriptions(payments, {
            status: "active",
          });

          // Highest rank wins when a customer holds several subscriptions.
          setRole(pickHighestRole(subscriptions.map((s) => s.role)));
        } catch (error) {
          console.error("Failed to fetch role subscriptions:", error);
          setRole(null);
        }
        setUser(authUser);
      } else {
        if (loggedOut !== "true") {
          signInAnonymously(auth).catch((error) => {
            console.error("Anonymous sign-in failed:", error);
          });
        }
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return <UserContext.Provider value={{ user, loading, role }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
