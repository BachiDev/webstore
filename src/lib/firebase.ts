
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeUI } from "@firebase-ui/core";

const firebaseConfig = {
  apiKey: "AIzaSyDlx6CHU-i50nv_MYCRckoyNTwMtA6_pxk",
  authDomain: "bachidev-webstore.firebaseapp.com",
  projectId: "bachidev-webstore",
  storageBucket: "bachidev-webstore.firebasestorage.app",
  messagingSenderId: "1004951580520",
  appId: "1:1004951580520:web:e7fdf51d4a097c628d30dd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const ui = initializeUI({ app });

export { app, auth, firestore, ui};
