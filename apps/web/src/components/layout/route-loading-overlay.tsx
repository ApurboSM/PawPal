import { Skeleton } from "@/components/ui/skeleton";

/**
 * Suspense fallback for a route chunk that has not downloaded yet.
 *
 * It fills the content area only — the navbar, bottom tab bar and footer are
 * mounted once in the app shell and must never be torn down by a navigation.
 *
 * There is deliberately no timed full-screen overlay here: an artificial minimum
 * display time makes every navigation feel like a page reload.
 */
export function RouteSkeletonFallback() {
  return (
    <div className="min-h-[60vh] bg-background" data-route-fallback="">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-12 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-2xl border bg-white p-6 lg:col-span-2">
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
