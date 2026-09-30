import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

/** Mono price pill — single source for price display (no hardcoded €). */
export function PriceTag({
  unitAmount,
  currency,
  interval,
  className,
}: {
  unitAmount: number | null | undefined;
  currency?: string;
  interval?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white/5 px-3 py-1 font-mono text-sm font-semibold text-zinc-100 ring-1 ring-white/10",
        className,
      )}
    >
      {formatPrice(unitAmount, currency)}
      {interval ? <span className="ml-1 font-normal text-zinc-400">/ {interval}</span> : null}
    </span>
  );
}

/** Accessible quantity stepper with caller-provided unique id. */
export function QtyStepper({
  id,
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  id: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  const clamp = (next: number) => {
    if (!Number.isFinite(next)) return;
    onChange(Math.min(max, Math.max(min, Math.floor(next))));
  };
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only">
        Quantity
      </label>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => clamp(value - 1)}
        disabled={value <= min}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-300 ring-1 ring-white/15 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => clamp(Number(e.target.value))}
        className="w-16 rounded-lg border border-white/10 bg-zinc-900 p-2 text-center font-mono text-sm text-zinc-100"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => clamp(value + 1)}
        disabled={value >= max}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-300 ring-1 ring-white/15 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

/** Empty state with optional CTA — never render a blank section. */
export function EmptyState({
  title,
  lede,
  action,
  className,
}: {
  title: string;
  lede?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-lg font-semibold text-zinc-100">{title}</p>
      {lede ? <p className="max-w-md text-sm text-zinc-400">{lede}</p> : null}
      {action}
    </div>
  );
}

/** Loading skeletons (perceived performance over blank grids). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-white/5", className)} aria-hidden="true" />
  );
}

export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Loading products"
      role="status"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-80" />
      ))}
    </div>
  );
}
