'use client';

import { auth, payments } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useRouter } from 'next/navigation';
import { useUser } from '../../lib/UserContext';
import Image from 'next/image';
import withAuth from '../../components/withAuth';
import { getCurrentUserSubscriptions, getCurrentUserPayments, Payment, Subscription } from '@invertase/firestore-stripe-payments';
import { useEffect, useState } from 'react';
import PaymentsTable from '../../components/PaymentsTable';
import SubscriptionsTable from '../../components/SubscriptionsTable';

const ProfilePage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const subscriptions = await getCurrentUserSubscriptions(payments, {
        status: 'active',
      });
      setSubscriptions(subscriptions);
      console.log("Fetched subscriptions:", subscriptions);
    };
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    const fetchPayments = async () => {
      const fetchedPayments = await getCurrentUserPayments(payments);
      setUserPayments(fetchedPayments);
      console.log("Fetched payments:", fetchedPayments);
    };
    if (user) {
      fetchPayments();
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

  const handleManageSubscription = async () => {
    try {
      const functions = getFunctions(undefined, 'europe-west3');
      const createPortalLink = httpsCallable(functions, 'ext-firestore-stripe-payments-createPortalLink');
      const { data } = await createPortalLink({ returnUrl: window.location.origin});
      const { url } = data as { url: string };
      router.push(url);
    } catch (error) {
      console.error("Error managing subscription:", error);
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
          <div className="flex space-x-4">
            <button onClick={handleManageSubscription} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">Manage Subscription</button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer">Logout</button>
          </div>
        </div>
      ) : (
        <p>Please log in to view your profile.</p>
      )}
      {subscriptions.length > 0 && <SubscriptionsTable subscriptions={subscriptions} />}
      {userPayments.length > 0 && <PaymentsTable payments={userPayments} />}
    </div>
  );
};

export default withAuth(ProfilePage);
