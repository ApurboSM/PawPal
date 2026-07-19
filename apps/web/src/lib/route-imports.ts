/**
 * Route path -> lazy chunk loader.
 *
 * Lives in its own module so navigation components can prefetch a route without
 * importing App (which imports them back — a cycle).
 *
 * Calling a loader more than once is free: the module registry returns the same
 * promise, so a prefetch and the eventual `lazy()` render share one download.
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
  "/privacy-policy": () => import("@/pages/privacy-policy-page"),
  "/terms-of-service": () => import("@/pages/terms-of-service-page"),
  "/cookie-policy": () => import("@/pages/cookie-policy-page"),
};

/** Detail routes carry an id, so they are matched by prefix rather than exactly. */
const PREFIX_IMPORTS: Array<[string, () => Promise<unknown>]> = [
  ["/pets/", () => import("@/pages/pet-detail-page")],
  ["/resources/", () => import("@/pages/resource-detail-page")],
  ["/appointments/", () => import("@/pages/appointment-detail-page")],
];

/** The five bottom-tab destinations, warmed once the browser goes idle. */
export const PRIMARY_ROUTES = ["/", "/pets", "/emergency", "/resources", "/appointments"];

/** Strips the query string so "/auth?next=/appointments" still resolves. */
function toPathname(href: string) {
  const queryIndex = href.indexOf("?");
  const hashIndex = href.indexOf("#");
  const cut = Math.min(
    queryIndex === -1 ? href.length : queryIndex,
    hashIndex === -1 ? href.length : hashIndex,
  );
  return href.slice(0, cut) || "/";
}

export function loaderFor(href: string): (() => Promise<unknown>) | undefined {
  const path = toPathname(href);
  const exact = ROUTE_IMPORTS[path];
  if (exact) return exact;

  // "/pets/register" is an exact entry above, so only real detail ids reach here.
  for (const [prefix, loader] of PREFIX_IMPORTS) {
    if (path.startsWith(prefix) && path.length > prefix.length) return loader;
  }
  return undefined;
}

/** Fire-and-forget warm-up. Safe to call repeatedly. */
export function prefetchRoute(href: string) {
  loaderFor(href)?.().catch(() => {});
}
