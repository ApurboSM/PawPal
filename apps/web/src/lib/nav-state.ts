import { useEffect, useState } from "react";

/**
 * The path the nav indicator should point at.
 *
 * Navigation is async (the route chunk has to resolve first), so keying the
 * indicator off `location` alone leaves it frozen for 30-120ms after a tap. This
 * records the tapped path immediately and lets the real location take over once
 * it catches up — so the capsule reacts on touch, and still self-corrects if the
 * router lands somewhere else (a protected route bouncing to /auth, say).
 */
export function useNavIntent(location: string, search: string, paths: string[]) {
  const [intent, setIntent] = useState<string | null>(null);

  useEffect(() => {
    if (!intent) return;
    // Clear the optimistic value once the router agrees, or if it went elsewhere.
    const settled = paths.some((path) => isNavItemActive(location, search, path));
    const matchesIntent = isNavItemActive(location, search, intent);
    if (matchesIntent || settled) setIntent(null);
  }, [location, search, intent, paths]);

  const activePath =
    paths.find((path) => (intent ? path === intent : isNavItemActive(location, search, path))) ??
    paths.find((path) => isNavItemActive(location, search, path)) ??
    null;

  return { activePath, setIntent };
}

/**
 * Runs the navigation one frame after the indicator update.
 *
 * Without this, React batches the capsule's move together with the incoming
 * page's render and paints them in the same commit — so the capsule sits still
 * for as long as the new route takes to render (measured 120-140ms), then leaps.
 * Yielding a frame lets the capsule paint first; the route costs one extra frame,
 * which is imperceptible next to the render it is waiting on anyway.
 */
export function deferNavigation(run: () => void) {
  if (typeof requestAnimationFrame !== "function") {
    run();
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(run));
}

/** Routes that ProtectedRoute bounces to /auth when signed out. */
export const PROTECTED_PATHS = ["/appointments", "/profile", "/admin", "/pets/register"];

export function isProtectedPath(path: string) {
  return PROTECTED_PATHS.includes(path);
}

/**
 * Where a nav link should point. Signed-out users heading somewhere protected go
 * to /auth carrying their destination, so login can hand them back to it.
 */
export function navHref(path: string, isSignedIn: boolean) {
  return !isSignedIn && isProtectedPath(path)
    ? `/auth?next=${encodeURIComponent(path)}`
    : path;
}

/**
 * Whether a nav entry should read as current.
 *
 * Nested routes keep their parent lit (/pets/12 -> Adopt). A signed-out user
 * sitting on /auth after tapping a protected link keeps that link lit too —
 * otherwise the indicator vanishes and there is no sign of where they were going.
 */
export function isNavItemActive(location: string, search: string, path: string) {
  if (location.startsWith("/auth")) {
    const next = new URLSearchParams(search).get("next");
    return Boolean(next) && next === path;
  }
  if (path === "/") return location === "/";
  return location === path || location.startsWith(`${path}/`);
}
