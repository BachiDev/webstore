'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '../lib/UserContext';
import type { ComponentType, FC } from 'react';

const withGuest = <P extends object>(WrappedComponent: ComponentType<P>): FC<P> => {
  const WithGuestComponent: FC<P> = (props) => {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!loading && user) {
        router.push('/profile');
      }
    }, [user, loading, router]);

    if (loading) {
      return <div>Loading...</div>; // Or a spinner component
    }

    return <WrappedComponent {...props} />;
  };

  WithGuestComponent.displayName = `withGuest(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;

  return WithGuestComponent;
};

export default withGuest;
