'use client';

import { useEffect, useState } from 'react';
import { firestore } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import withAuth from '../../../components/withAuth';
import { useUser } from '../../../lib/UserContext';

const StarterContentPage = () => {
  const { user, role } = useUser();
  const [content, setContent] = useState<string[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      if (role === 'Starter' || role === 'Pro' || role === 'Premium') {
        const querySnapshot = await getDocs(collection(firestore, 'content-starter'));
        const starterContent = querySnapshot.docs.map(doc => doc.data().content as string);
        setContent(starterContent);
      }
    };

    if (user) {
      fetchContent();
    }
  }, [user, role]);

  if (role !== 'Starter' && role !== 'Pro' && role !== 'Premium') {
    return <div className="text-black container mx-auto p-4">You do not have permission to view this content.</div>;
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
