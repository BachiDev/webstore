'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '../lib/UserContext';

const withAuth = (Component: React.ComponentType) => {
  const AuthComponent = (props: any) => {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth');
      }
    }, [user, loading, router]);

    if (loading || !user) {
      return <div className="flex min-h-screen items-center justify-center">Loading...</div>; // Or a loading spinner
    }

    return <Component {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
