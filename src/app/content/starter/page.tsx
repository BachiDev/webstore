'use client';

import withAuth from '@/components/withAuth';
import { useContent } from '../../../lib/useContent';
import { useRole } from '../../../lib/useRole';

const StarterContentPage = () => {
  const { isStarter } = useRole();
  const { content, loading } = useContent('content-starter');

  if (!isStarter) {
    return <div className="text-black container mx-auto p-4">You do not have permission to view this content.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-black text-2xl font-bold mb-4">Starter Content</h1>
      <ul className="text-black">
        {content.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default withAuth(StarterContentPage);
