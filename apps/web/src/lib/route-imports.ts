/**
 * Route path -> lazy chunk loader.
 *
 * Lives in its own module so navigation components can prefetch a route without
 * importing App (which imports them back — a cycle).
 *
 * Calling a loader more than once is free: the module registry returns the same
 * promise, so prefetching and the eventual `lazy()` render share one download.
 */
export const ROUTE_IMPORTS: Record<string, () => Promise<unknown>> = {
  "/": () => import("@/pages/home-page"),
  "/auth": () => import("@/pages/auth-page"),
  "/pets": () => import("@/pages/pets-page"),
  "/pets/register": () => import("@/pages/pet-register-page"),
  "/resources": () => import("@/pages/resources-page"),
  "/emergency": () => import("@/pages/emergency-page"),
  "/appointments": () => import("@/pages/appointment-page"),
  "/contact": () => import("@/pages/contact-page"),
  "/profile": () => import("@/pages/profile-page"),
  "/admin": () => import("@/pages/admin-page"),
};

/** The five bottom-tab destinations, warmed once the browser goes idle. */
export const PRIMARY_ROUTES = ["/", "/pets", "/emergency", "/resources", "/appointments"];

export function prefetchRoute(path: string) {
  ROUTE_IMPORTS[path]?.().catch(() => {});
}
