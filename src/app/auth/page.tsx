'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { GoogleAuthProvider, EmailAuthProvider, signInAnonymously } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';

import type { auth as firebaseAuth } from 'firebaseui';

const AuthPage = () => {
  const [firebaseui, setFirebaseui] = useState<{
    auth: typeof firebaseAuth;
  } | null>(null);

  useEffect(() => {
    // Dynamically import FirebaseUI only on the client side
    import('firebaseui').then(ui => {
      setFirebaseui(ui);
    });
  }, []);

  useEffect(() => {
    if (firebaseui) {
      // Get an instance of the FirebaseUI Auth widget
      const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

      // Start the FirebaseUI widget
      ui.start('#firebaseui-auth-container', {
        signInOptions: [
          // List of providers for the main UI
          GoogleAuthProvider.PROVIDER_ID,
          EmailAuthProvider.PROVIDER_ID
        ],
        signInFlow: 'popup',
        callbacks: {
          signInSuccessWithAuthResult: function (authResult) {
            // This is the callback for successful logins
            // You can add your custom logic here (e.g., redirect to dashboard)
            return true; // Return true to redirect to signInSuccessUrl or false to prevent it
          },
          uiShown: function () {
            // Hide the loader when the UI widget is displayed
            const loader = document.getElementById('loader');
            if (loader) {
              loader.style.display = 'none';
            }
          },
        },
      });
    }
  }, [firebaseui]);

  const handleGuestLogin = async () => {
    try {
      // Use the core Firebase SDK function for anonymous sign-in
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Error signing in anonymously:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-8">Login</h1>
      <p className='mb-8'>(for the Demo as Guest is totally fine)</p>
      <button onClick={handleGuestLogin} className="mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">Login as Guest</button>
      <div id="firebaseui-auth-container"></div>
      <div id="loader">Loading...</div>
    </div>
  );
};

export default AuthPage;