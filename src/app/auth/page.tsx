'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';

import type { auth as firebaseAuth } from 'firebaseui';

const AuthPage = () => {
  const [firebaseui, setFirebaseui] = useState<{
    auth: typeof firebaseAuth;
  } | null>(null);

  useEffect(() => {
    import('firebaseui').then(ui => {
      setFirebaseui(ui);
    });
  }, []);

  useEffect(() => {
    if (firebaseui) {
      const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
      ui.start('#firebaseui-auth-container', {
        signInOptions: [GoogleAuthProvider.PROVIDER_ID, EmailAuthProvider.PROVIDER_ID],
        signInFlow: 'popup',
        callbacks: {
          signInSuccessWithAuthResult: function () {
            return true;
          },
          uiShown: function () {
            const loader = document.getElementById('loader');
            if (loader) {
              loader.style.display = 'none';
            }
          },
        },
      });
    }
  }, [firebaseui]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-8">Login</h1>
      <div id="firebaseui-auth-container"></div>
      <div id="loader">Loading...</div>
    </div>
  );
};

export default AuthPage;