import { Skeleton } from "@/components/ui/ShopBits";

export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16"
      role="status"
      aria-label="Loading page"
    >
      <Skeleton className="h-6 w-48" />
      <Skeleton className="mt-3 h-10 w-2/3" />
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
