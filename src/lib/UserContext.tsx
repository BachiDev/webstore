// src/lib/UserContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase'; // Your Firebase auth instance
import type { User } from 'firebase/auth';

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({ user: null, loading: true });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (authUser) => {
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
      }
      setUser(authUser);
      setLoading(false);
    }
  });
  return () => unsubscribe();
}, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);