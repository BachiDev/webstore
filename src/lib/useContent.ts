import { useState, useEffect } from 'react';
import { firestore } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useUser } from './UserContext';

export const useContent = (collectionName: string) => {
  const { user } = useUser();
  const [content, setContent] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, collectionName));
        const fetchedContent = querySnapshot.docs.map(doc => doc.data().content as string);
        setContent(fetchedContent);
      } catch (error) {
        console.error(`Error fetching content from ${collectionName}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchContent();
    }
  }, [user, collectionName]);

  return { content, loading };
};
