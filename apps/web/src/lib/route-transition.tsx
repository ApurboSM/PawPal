import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import { prefetchRoute } from "@/lib/route-imports";

type RouteTransitionValue = {
  /** Navigate inside a React transition so the current page stays on screen
   *  while the next route's chunk loads, instead of flashing a skeleton. */
  navigateTo: (href: string) => void;
  isPending: boolean;
};

const RouteTransitionContext = createContext<RouteTransitionValue | null>(null);

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [isPending, startTransition] = useTransition();

  const navigateTo = useCallback(
    (href: string) => {
      // Kick the chunk off first; if it is already cached the transition
      // resolves in the same tick and nothing visibly happens at all.
      prefetchRoute(href);
      startTransition(() => navigate(href));
    },
    [navigate],
  );

  const value = useMemo(() => ({ navigateTo, isPending }), [navigateTo, isPending]);

  return (
    <RouteTransitionContext.Provider value={value}>{children}</RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) {
    throw new Error("useRouteTransition must be used within a RouteTransitionProvider");
  }
  return ctx;
}

/**
 * Returns true only once a navigation has been pending long enough to be worth
 * showing. Instant navigations never trigger it, so the UI stays quiet.
 */
export function useDelayedPending(isPending: boolean, delayMs = 140) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isPending) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [isPending, delayMs]);

  return visible;
}

/**
 * Intercepts a link click so navigation runs through a transition.
 * Modifier-clicks and non-primary buttons fall through to the browser.
 */
export function shouldHandleClick(event: React.MouseEvent) {
  return !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}
