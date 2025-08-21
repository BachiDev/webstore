// src/lib/UserContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged} from 'firebase/auth';
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
      // The autoAnonymousLogin behavior handles the initial sign-in.
      // We no longer need to call signInAnonymously() here.

      // If a user exists (anonymous or permanent), fetch their data.
      if (authUser) {
        localStorage.removeItem('logged_out');
        
        const subscriptions = await getCurrentUserSubscriptions(payments, {
          status: 'active',
        });

        if (subscriptions.length > 0) {
          setRole(subscriptions[0].role);
        } else {
          setRole(null); // Clear role if no active subscriptions
        }
      }

      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Keep the empty dependency array

  return (
    <UserContext.Provider value={{ user, loading, role }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);