"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { friendlyAuthError, sendMagicLink, signInWithGoogle } from "@/lib/auth";
import toast from "react-hot-toast";
import { Loader2, MailCheck } from "lucide-react";
import withGuest from "../../components/withGuest";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Multicolor Google "G" (lucide ships no brand icons). */
function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.3 7.5 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.5-2.7-.1.1C.6 8.7 0 10.3 0 12s.6 3.3 1.6 4.9l3.6-2.5z"
      />
      <path
        fill="#EA4335"
        d="M12 4.6c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.7 1.6 6.9l3.6 2.7c1-2.9 3.7-5 6.8-5z"
      />
    </svg>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [linkSentTo, setLinkSentTo] = useState<string | null>(null);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only permanent accounts leave /auth automatically — anonymous guests
      // stay so they can upgrade (sign-in links the anon account).
      if (user?.email) {
        router.push("/profile");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error during anonymous sign-in:", error);
      toast.error("Guest login failed. Please try again.");
      setIsGuestLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      toast.success(result === "linked" ? "Account connected!" : "Signed in with Google!");
    } catch (error) {
      console.error("Google sign-in failed:", error);
      toast.error(friendlyAuthError(error));
      setIsGoogleLoading(false);
    }
  };

  const handleMagicLink = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError(null);
    setIsSendingLink(true);
    try {
      await sendMagicLink(trimmed);
      setLinkSentTo(trimmed);
    } catch (error) {
      console.error("Magic link failed:", error);
      toast.error(friendlyAuthError(error));
    } finally {
      setIsSendingLink(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-12 md:py-16">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
        Account
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">Sign in</h1>
      <p className="mt-3 text-center text-sm text-zinc-400">
        No passwords here — use Google or a magic email link. Signing in keeps your purchases on
        your account; the cart itself stays in this browser.
      </p>
      <Card className="mt-8 w-full items-stretch gap-4">
        {linkSentTo ? (
          <div className="flex flex-col items-center gap-3 text-center" role="status">
            <MailCheck className="h-10 w-10 text-brand-300" aria-hidden="true" />
            <p className="font-bold text-lg text-zinc-100">Check your inbox</p>
            <p className="text-sm leading-relaxed text-zinc-400">
              We sent a sign-in link to{" "}
              <span className="font-mono text-zinc-200">{linkSentTo}</span>. It expires in about an
              hour — open it on any device.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={isSendingLink}
                onClick={() => {
                  setLinkSentTo(null);
                }}
              >
                Use a different email
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Official Google button treatment (dark variant for dark themes, per
                Google's "Sign in with Google" branding guidelines): dark
                surface, light text, unmodified G mark, rectangular shape.
                Do not apply brand colors or pill rounding here. */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={isGoogleLoading}
              className="flex h-10 w-full cursor-pointer items-center justify-center gap-3 rounded bg-[#131314] px-4 text-sm font-medium text-[#E3E3E3] ring-1 ring-[#8E918F] transition-colors hover:bg-[#1F1F20] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontFamily: "Roboto, system-ui, sans-serif" }}
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <GoogleIcon className="h-[18px] w-[18px]" />
              )}
              {isGoogleLoading ? "Connecting…" : "Continue with Google"}
            </button>
            <Button
              variant="ghost"
              onClick={handleGuestLogin}
              disabled={isGuestLoading}
              className="w-full"
            >
              {isGuestLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isGuestLoading ? "Creating guest session…" : "Continue as Guest"}
            </Button>
            <div className="flex w-full items-center gap-3" aria-hidden="true">
              <hr className="grow border-white/10" />
              <span className="text-xs text-zinc-400">or</span>
              <hr className="grow border-white/10" />
            </div>
            <form onSubmit={handleMagicLink} className="flex flex-col gap-2" noValidate={false}>
              <label
                htmlFor="magic-email"
                className="font-mono text-xs uppercase tracking-wider text-zinc-400"
              >
                Email
              </label>
              <input
                id="magic-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                placeholder="you@example.com"
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? "magic-email-error" : undefined}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-400 focus:border-brand-500/50 focus:outline-none"
              />
              {emailError && (
                <p id="magic-email-error" className="text-sm text-red-400" role="alert">
                  {emailError}
                </p>
              )}
              <Button type="submit" variant="secondary" disabled={isSendingLink} className="w-full">
                {isSendingLink && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isSendingLink ? "Sending…" : "Send link"}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
};

export default withGuest(AuthPage);
