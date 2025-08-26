// src/lib/UserContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, payments } from './firebase';
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
      const loggedOut = localStorage.getItem('logged_out');
      if (authUser) {
        localStorage.removeItem('logged_out');

        const subscriptions = await getCurrentUserSubscriptions(payments, {
          status: 'active',
        });

        if (subscriptions.length > 0) {
          setRole(subscriptions[0].role);
        } else {
          setRole(null);
        }
        setUser(authUser);
      } else {
        if (loggedOut !== 'true') {
          signInAnonymously(auth).catch((error) => {
            console.error('Anonymous sign-in failed:', error);
          });
        }
        setUser(null);
      }
      setLoading(false);
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