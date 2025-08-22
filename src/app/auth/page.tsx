'use client';

import { useState, useEffect } from 'react';
import {
  SignInAuthScreen,
  SignUpAuthScreen,
} from '@firebase-ui/react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import withGuest from '../../components/withGuest';
import withAuth from '@/components/withAuth';

const AuthPage = () => {
  const router = useRouter();
  const [view, setView] = useState<'signIn' | 'signUp'>('signIn');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in. UID:", user.uid);
        router.push('/profile');
      } else {
        console.log("No user is logged in.");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGuestLogin = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error during anonymous sign-in:", error);
    }
  };

  const handleToggleView = (newView: 'signIn' | 'signUp') => {
    setView(newView);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">

<button                                                                                                                               
onClick={handleGuestLogin}                                                                                                            
 className="mt-4 px-4 py-2 rounded-lg font-semibold text-white bg-black rounded hover:bg-neutral-700 cursor-pointer">                  
     Login as Guest                                                                                                                        
 </button>                                                                                                                               
      <div className="flex items-center my-4">                                                                                                
        <hr className="flex-grow border-gray-300" />                                                                                          
        <span className="px-4 text-gray-500 text-sm">or</span>                                                                                
      <hr className="flex-grow border-gray-300" />                                                                                         
      </div>                                                                                                                                  
                                                                                                                                             
      <div className="flex space-x-4 ">                                                                                                      
        <button
          onClick={() => handleToggleView('signIn')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 cursor-pointer ${
            view === 'signIn' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 '
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => handleToggleView('signUp')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 cursor-pointer ${
           view === 'signUp' ? 'bg-black text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 '
          }`}
        >
          Sign Up
        </button>
      </div>

      {view === 'signIn' ? (
        <SignInAuthScreen />
      ) : (
        <SignUpAuthScreen />
      )}
      </div>
  );
};

export default (AuthPage);
