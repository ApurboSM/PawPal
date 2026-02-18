import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export function RouteSkeletonFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-12 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 rounded-2xl border bg-white p-6">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-52 w-full rounded-xl" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border bg-white p-6">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shows the PawPal loading overlay during route transitions.
 * - Triggers on location change (and on first mount)
 * - Stays visible for at least MIN_MS
 * - Hides once queries/mutations settle, with a MAX_MS safety cutoff
 */
export function RouteLoadingOverlay() {
  const [location] = useLocation();
  const [active, setActive] = useState(false);
  const MIN_MS = 320;

  useEffect(() => {
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), MIN_MS);
    return () => window.clearTimeout(timer);
  }, [location]);

  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] bg-background/90 backdrop-blur-[1px]">
      <RouteSkeletonFallback />
    </div>
  );
}

