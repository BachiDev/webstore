"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, MailWarning } from "lucide-react";
import {
  completeMagicLink,
  friendlyAuthError,
  isSignInWithEmailLink,
  storedMagicLinkEmail,
  clearStoredMagicLinkEmail,
} from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/ShopBits";

type Status = "working" | "need-email" | "error";

const FinishPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("working");
  const [email, setEmail] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  const finish = async (address: string) => {
    setIsCompleting(true);
    try {
      const result = await completeMagicLink(window.location.href, address.trim());
      clearStoredMagicLinkEmail();
      toast.success(result === "linked" ? "Account connected — welcome!" : "Signed in — welcome!");
      router.push("/profile");
    } catch (error) {
      console.error("Magic link completion failed:", error);
      toast.error(friendlyAuthError(error));
      setStatus("error");
      setIsCompleting(false);
    }
  };

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setStatus("error");
      return;
    }
    const stored = storedMagicLinkEmail();
    if (stored) {
      finish(stored);
    } else {
      // Link opened on another device — ask which address the link went to.
      setStatus("need-email");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (email.trim()) finish(email);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-12 md:py-16">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
        Magic link
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">Finishing sign-in</h1>
      <Card className="mt-8 w-full items-center gap-4 text-center">
        {status === "working" && (
          <div className="flex flex-col items-center gap-3" role="status" aria-label="Signing in">
            <Loader2 className="h-8 w-8 animate-spin text-brand-300" aria-hidden="true" />
            <p className="text-sm text-zinc-400">Verifying your link…</p>
            <Skeleton className="h-4 w-40" />
          </div>
        )}
        {status === "need-email" && (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
            <p className="text-sm leading-relaxed text-zinc-400">
              Confirm the email address this link was sent to:
            </p>
            <label htmlFor="finish-email" className="sr-only">
              Email address
            </label>
            <input
              id="finish-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-400 focus:border-brand-500/50 focus:outline-none"
            />
            <Button type="submit" disabled={isCompleting || !email.trim()} className="w-full">
              {isCompleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isCompleting ? "Signing in…" : "Complete sign-in"}
            </Button>
          </form>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center gap-3" role="alert">
            <MailWarning className="h-10 w-10 text-amber-200" aria-hidden="true" />
            <p className="font-bold text-lg text-zinc-100">That link didn’t work</p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Links expire after about an hour and work only once. Request a fresh one:
            </p>
            <Button href="/auth">Back to sign-in</Button>
          </div>
        )}
      </Card>
      <p className="mt-4 text-sm text-zinc-400">
        <Link href="/" className="underline-offset-4 hover:text-zinc-100 hover:underline">
          Back home
        </Link>
      </p>
    </div>
  );
};

export default FinishPage;
