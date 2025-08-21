// src/lib/UserContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, payments } from './firebase'; // Your Firebase auth instance
import type { User } from 'firebase/auth';
import { getCurrentUserSubscriptions } from '@invertase/firestore-stripe-payments';

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
      if (!authUser && localStorage.getItem('logged_out') !== 'true') {
        signInAnonymously(auth)
          .then(() => {
            console.log("Signed in anonymously!");
          })
          .catch((error) => {
            console.error("Anonymous sign-in failed:", error);
          });
      } else {
        // Clear the flag after a successful sign-in
        if (authUser) {
          localStorage.removeItem('logged_out');
          const subscriptions = await getCurrentUserSubscriptions(payments, {
            status: 'active',
          });
          if (subscriptions.length > 0) {
            setRole(subscriptions[0].role);
          }
        }
        setUser(authUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, role }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);