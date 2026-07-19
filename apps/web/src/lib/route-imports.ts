import { createLazyRoute, type LazyRoute } from "@/lib/lazy-route";

/**
 * Route path -> route component.
 *
 * Lives in its own module so navigation components can prefetch a route without
 * importing App (which imports them back — a cycle).
 *
 * Each entry renders synchronously once preloaded, so a prefetched navigation
 * never shows a Suspense skeleton. See lib/lazy-route.tsx.
 */
export const ROUTES: Record<string, LazyRoute> = {
  "/": createLazyRoute(() => import("@/pages/home-page")),
  "/auth": createLazyRoute(() => import("@/pages/auth-page")),
  "/pets": createLazyRoute(() => import("@/pages/pets-page")),
  "/pets/register": createLazyRoute(() => import("@/pages/pet-register-page")),
  "/resources": createLazyRoute(() => import("@/pages/resources-page")),
  "/emergency": createLazyRoute(() => import("@/pages/emergency-page")),
  "/appointments": createLazyRoute(() => import("@/pages/appointment-page")),
  "/contact": createLazyRoute(() => import("@/pages/contact-page")),
  "/profile": createLazyRoute(() => import("@/pages/profile-page")),
  "/admin": createLazyRoute(() => import("@/pages/admin-page")),
  "/privacy-policy": createLazyRoute(() => import("@/pages/privacy-policy-page")),
  "/terms-of-service": createLazyRoute(() => import("@/pages/terms-of-service-page")),
  "/cookie-policy": createLazyRoute(() => import("@/pages/cookie-policy-page")),
};

/** Detail routes carry an id, so they are matched by prefix rather than exactly. */
export const PET_DETAIL_ROUTE = createLazyRoute(() => import("@/pages/pet-detail-page"));
export const RESOURCE_DETAIL_ROUTE = createLazyRoute(() => import("@/pages/resource-detail-page"));
export const APPOINTMENT_DETAIL_ROUTE = createLazyRoute(
  () => import("@/pages/appointment-detail-page"),
);
export const NOT_FOUND_ROUTE = createLazyRoute(() => import("@/pages/not-found"));

const PREFIX_ROUTES: Array<[string, LazyRoute]> = [
  ["/pets/", PET_DETAIL_ROUTE],
  ["/resources/", RESOURCE_DETAIL_ROUTE],
  ["/appointments/", APPOINTMENT_DETAIL_ROUTE],
];

/** The five bottom-tab destinations, warmed once the browser goes idle. */
export const PRIMARY_ROUTES = ["/", "/pets", "/emergency", "/resources", "/appointments"];

/** Strips query/hash so "/auth?next=/appointments" still resolves. */
function toPathname(href: string) {
  const queryIndex = href.indexOf("?");
  const hashIndex = href.indexOf("#");
  const cut = Math.min(
    queryIndex === -1 ? href.length : queryIndex,
    hashIndex === -1 ? href.length : hashIndex,
  );
  return href.slice(0, cut) || "/";
}

export function routeFor(href: string): LazyRoute | undefined {
  const path = toPathname(href);
  const exact = ROUTES[path];
  if (exact) return exact;

  // "/pets/register" is an exact entry above, so only real detail ids reach here.
  for (const [prefix, route] of PREFIX_ROUTES) {
    if (path.startsWith(prefix) && path.length > prefix.length) return route;
  }
  return undefined;
}

/** Fire-and-forget warm-up. Safe to call repeatedly. */
export function prefetchRoute(href: string) {
  void routeFor(href)?.preload();
}
