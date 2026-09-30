import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-20 text-center md:py-28">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50">Page not found</h1>
      <p className="mt-3 max-w-md text-zinc-400">
        This product or page doesn’t exist — it may have been removed from the catalog.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/store">Browse the store</Button>
        <Button href="/" variant="secondary">
          Back home
        </Button>
      </div>
    </div>
  );
}
