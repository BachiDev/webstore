'use client';

import withAuth from '@/components/withAuth';
import { useContent } from '../../../lib/useContent';
import { useRole } from '../../../lib/useRole';

const PremiumContentPage = () => {
  const { isPremium } = useRole();
  const { content, loading } = useContent('content-premium');

  if (!isPremium) {
    return <div className="text-black container mx-auto p-4">You do not have permission to view this content.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-black text-2xl font-bold mb-4">Premium Content</h1>
      <ul className="text-black">
        {content.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default withAuth(PremiumContentPage);
