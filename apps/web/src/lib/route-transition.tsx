import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import { routeFor } from "@/lib/route-imports";

type RouteTransitionValue = {
  /**
   * Navigates only once the target route's chunk has resolved, so the current
   * page stays on screen instead of being replaced by a Suspense skeleton.
   * Already-downloaded routes commit on the next microtask — effectively instant.
   */
  navigateTo: (href: string) => void;
  isPending: boolean;
};

const RouteTransitionContext = createContext<RouteTransitionValue | null>(null);

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [isPending, setIsPending] = useState(false);
  // Guards against a slow chunk landing after the user has tapped elsewhere.
  const latestNavigation = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      const route = routeFor(href);

      // Unknown route, or one whose chunk is already resolved: commit immediately
      // so a warm navigation costs nothing at all.
      if (!route || route.isReady()) {
        navigate(href);
        return;
      }

      const token = ++latestNavigation.current;
      setIsPending(true);

      route
        .preload()
        .catch(() => {
          // A failed chunk still navigates: the error boundary/404 should decide,
          // not a nav link that silently does nothing.
        })
        .finally(() => {
          if (!mounted.current || token !== latestNavigation.current) return;
          setIsPending(false);
          navigate(href);
        });
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
 * showing. Instant (prefetched) navigations never trigger it, so the UI stays quiet.
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
 * Intercepts a link click so navigation runs through the transition.
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
