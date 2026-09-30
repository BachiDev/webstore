import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-brand-500 to-fuchsia-600 text-white shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-fuchsia-700",
  secondary: "bg-white/5 text-zinc-100 ring-1 ring-white/15 hover:bg-white/10 hover:ring-white/25",
  ghost: "text-zinc-300 hover:bg-white/5 hover:text-white",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

type ButtonProps = {
  children: ReactNode;
  href?: string;
  /** Defaults to true for absolute URLs. */
  external?: boolean;
  download?: boolean | string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  children,
  href,
  external,
  download,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    const isExternal = external ?? /^https?:/.test(href);
    if (isExternal || download) {
      return (
        <a
          href={href}
          className={classes}
          {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
          {...(download ? { download: download === true ? "" : download } : {})}
          onClick={onClick}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
