'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '../lib/UserContext';
import type { ComponentType, FC } from 'react';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>): FC<P> => {
  const WithAuthComponent: FC<P> = (props) => {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth');
      }
    }, [user, loading, router]);

    if (loading) {
      return <div>Loading...</div>; // Or a spinner component
    }

    if (!user) {
      return null; // Or a redirect component
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return WithAuthComponent;
};

export default withAuth;
