import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { footerNav, site } from "@/data/site";

export function Footer() {
  return (
    <footer className="w-full shrink-0 bg-zinc-900 px-4 py-8 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs space-y-1">
            <p className="text-sm font-semibold text-zinc-200">{site.name}</p>
            <p className="text-xs text-zinc-400">{site.tagline}.</p>
            <p className="font-mono text-xs text-zinc-400">Test mode — no real charges.</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Footer">
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="#main"
              aria-label="Back to top"
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 ring-1 ring-white/10 transition-colors hover:text-white hover:ring-brand-500/50"
            >
              <ArrowUp className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Fabian Bachmayer. All rights reserved. |{" "}
            <Link href={site.imprintUrl} className="hover:text-zinc-300 hover:underline">
              Imprint
            </Link>
          </p>
          <p className="text-xs text-zinc-400">
            Built with Next.js & Tailwind —{" "}
            <Link
              href={site.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-300 hover:underline"
            >
              source on GitHub
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
