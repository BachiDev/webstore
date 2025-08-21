'use client';

import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser } from '../../lib/UserContext';
import Image from 'next/image';
import withAuth from '../../components/withAuth';

const ProfilePage = () => {
  const router = useRouter();
  const { user } = useUser();

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
    </div>
  );
};

export default withAuth(ProfilePage);