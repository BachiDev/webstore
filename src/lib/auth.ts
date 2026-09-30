// src/lib/auth.ts — passwordless auth (magic link + Google) with
// anonymous-account linking, so a guest's cart survives sign-in.

import {
  EmailAuthProvider,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  linkWithCredential,
  linkWithPopup,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  type AuthError,
} from "firebase/auth";
import { auth } from "./firebase";

const EMAIL_STORAGE_KEY = "emailForSignIn";

const googleProvider = new GoogleAuthProvider();

const codeOf = (error: unknown): string => (error as AuthError)?.code ?? "unknown";

const ALREADY_IN_USE = ["auth/credential-already-in-use", "auth/email-already-in-use"];

/**
 * Refresh profile fields (displayName/photoURL/emailVerified) after linking —
 * the merged provider data is not always present on the user object yet.
 * Non-fatal: the auth-state listener still delivers the signed-in user.
 */
async function refreshProfile(user: { reload: () => Promise<void> }): Promise<void> {
  try {
    await user.reload();
  } catch {
    // Ignore — profile fields arrive via onAuthStateChanged regardless.
  }
}

/** Human copy for Firebase auth failures (also surfaced via toast). */
export function friendlyAuthError(error: unknown): string {
  switch (codeOf(error)) {
    case "auth/invalid-email":
      return "That email address doesn’t look right — check it and try again.";
    case "auth/unauthorized-continue-uri":
      return "This domain isn’t authorized for email sign-in yet (Firebase console → Authentication → Settings → Authorized domains).";
    case "auth/quota-exceeded":
    case "auth/limits-exceeded":
      return "Too many attempts — wait a bit and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "The Google window was closed — try again when ready.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google window — allow popups and retry.";
    case "auth/expired-action-code":
      return "That link expired — request a fresh one below.";
    case "auth/invalid-action-code":
      return "That link is invalid or already used — request a fresh one below.";
    case "auth/network-request-failed":
      return "Network hiccup — check your connection and retry.";
    case "auth/user-disabled":
      return "This account was disabled — contact fabian@bachi.dev.";
    default:
      return "Something went wrong — please try again.";
  }
}

/** Send a passwordless sign-in link; remembers the address for this device. */
export async function sendMagicLink(email: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email.trim(), {
    url: `${window.location.origin}/auth/finish`,
    handleCodeInApp: true,
  });
  try {
    window.localStorage.setItem(EMAIL_STORAGE_KEY, email.trim());
  } catch {
    // Private mode: the finish page will ask for the address instead.
  }
}

export function storedMagicLinkEmail(): string | null {
  try {
    return window.localStorage.getItem(EMAIL_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearStoredMagicLinkEmail(): void {
  try {
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  } catch {
    // Ignore — storage unavailable.
  }
}

/**
 * Complete a magic-link sign-in. Anonymous guests are *linked* (cart kept);
 * everyone else signs in normally. Falls back to plain sign-in when the
 * address already belongs to another account.
 */
export async function completeMagicLink(
  href: string,
  email: string,
): Promise<"linked" | "signed-in"> {
  const anon = auth.currentUser;
  if (anon?.isAnonymous) {
    try {
      await linkWithCredential(anon, EmailAuthProvider.credentialWithLink(email, href));
      await refreshProfile(anon);
      return "linked";
    } catch (error) {
      if (!ALREADY_IN_USE.includes(codeOf(error))) throw error;
      await signInWithEmailLink(auth, email, href);
      return "signed-in";
    }
  }
  await signInWithEmailLink(auth, email, href);
  return "signed-in";
}

/**
 * Google sign-in with the same anonymous-linking behavior as magic link.
 * Popup cancellations rethrow for the caller to toast.
 */
export async function signInWithGoogle(): Promise<"linked" | "signed-in"> {
  const anon = auth.currentUser;
  if (anon?.isAnonymous) {
    try {
      await linkWithPopup(anon, googleProvider);
      await refreshProfile(anon);
      return "linked";
    } catch (error) {
      if (!ALREADY_IN_USE.includes(codeOf(error))) throw error;
      await signInWithPopup(auth, googleProvider);
      return "signed-in";
    }
  }
  await signInWithPopup(auth, googleProvider);
  return "signed-in";
}

export { isSignInWithEmailLink };
