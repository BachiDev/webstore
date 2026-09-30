import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStripePayments } from "@invertase/firestore-stripe-payments";
import { firebaseConfig } from "./env";

// getApps() guard: safe under Next.js HMR / Fast Refresh double-init.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const payments = getStripePayments(app, {
  productsCollection: "products",
  customersCollection: "customers",
});

export { app, auth, firestore, payments };
