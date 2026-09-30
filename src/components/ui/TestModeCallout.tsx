import { FlaskConical } from "lucide-react";
import { isDemoBannerEnabled } from "@/lib/env";
import { demoTestCard } from "@/data/site";

/**
 * Designed test-mode callout — replaces the old red PaymentNotice banner.
 * Env-gated: renders nothing when NEXT_PUBLIC_DEMO_BANNER=false.
 */
export function TestModeCallout() {
  if (!isDemoBannerEnabled) {
    return null;
  }
  return (
    <div
      className="mb-8 flex flex-col gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm sm:flex-row sm:items-center sm:gap-4"
      role="note"
      aria-label="Test mode payment notice"
    >
      <p className="flex items-center gap-2 font-semibold text-amber-200">
        <FlaskConical className="h-4 w-4 shrink-0" aria-hidden="true" />
        Test mode — no real charges
      </p>
      <p className="font-mono text-xs text-zinc-300">
        Card {demoTestCard.number} · Exp {demoTestCard.expiry} · CVC {demoTestCard.cvc}
      </p>
      <a
        href={demoTestCard.docsUrl}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline sm:ml-auto"
      >
        Stripe test docs
      </a>
    </div>
  );
}
