'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '../lib/UserContext';

const withGuest = (Component: React.ComponentType) => {
  const GuestComponent = (props: any) => {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!loading && user) {
        router.push('/profile');
      }
    }, [user, loading, router]);

    if (loading) {
      return <div className="flex min-h-screen items-center justify-center">Loading...</div>; // Or a loading spinner
    }

    return <Component {...props} />;
  };

  return GuestComponent;
};

export default withGuest;
