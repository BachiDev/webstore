'use client';

import { auth, payments } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser } from '../../lib/UserContext';
import Image from 'next/image';
import withAuth from '../../components/withAuth';
import { getCurrentUserSubscriptions, Subscription } from '@invertase/firestore-stripe-payments';
import { useEffect, useState } from 'react';

const ProfilePage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const subscriptions = await getCurrentUserSubscriptions(payments, {
        status: 'active',
      });
      setSubscriptions(subscriptions);
    };
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      localStorage.setItem('logged_out', 'true');
      await signOut(auth);
      router.push('/'); // Redirect to home page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {user ? (
        <div className="flex flex-col items-center">
          <Image src={user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'} alt="Profile" width={96} height={96} className="rounded-full mb-4" />
          <p className="text-lg mb-2 text-black">Email: {user.email || 'N/A'}</p>
          <p className="text-lg mb-4 text-black">UID: {user.uid}</p>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer">Logout</button>
        </div>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
      {subscriptions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Active Subscriptions</h2>
          <ul>
            {subscriptions.map(subscription => (
              <li key={subscription.id} className="mb-4 p-4 border rounded-md">
                <p className="text-lg font-bold">Role: {subscription.role}</p>
                <p>Current period end: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default withAuth(ProfilePage);