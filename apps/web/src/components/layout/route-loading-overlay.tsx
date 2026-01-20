import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { PawLoadingOverlay } from "@/components/ui/paw-loading-overlay";

/**
 * Shows the PawPal loading overlay during route transitions.
 * - Triggers on location change (and on first mount)
 * - Stays visible for at least MIN_MS
 * - Hides once queries/mutations settle, with a MAX_MS safety cutoff
 */
export function RouteLoadingOverlay() {
  const [location] = useLocation();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const prevLocationRef = useRef<string | null>(null);
  const [active, setActive] = useState(false);
  const startedAtRef = useRef<number>(0);

  const MIN_MS = 250;
  const MAX_MS = 6000;

  // Start loader on first mount and on route changes
  useEffect(() => {
    const prev = prevLocationRef.current;
    prevLocationRef.current = location;

    // First mount OR route change
    if (prev === null || prev !== location) {
      startedAtRef.current = Date.now();
      setActive(true);
    }
  }, [location]);

  // Auto-hide when settled (and min duration passed), with max cutoff
  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const startedAt = startedAtRef.current;

    const tick = () => {
      if (cancelled) return;
      const elapsed = Date.now() - startedAt;

      if (elapsed >= MAX_MS) {
        setActive(false);
        return;
      }

      const settled = isFetching === 0 && isMutating === 0;
      if (settled && elapsed >= MIN_MS) {
        setActive(false);
        return;
      }

      const delay = settled ? Math.max(20, MIN_MS - elapsed) : 120;
      window.setTimeout(tick, delay);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [active, isFetching, isMutating]);

  if (!active) return null;
  return <PawLoadingOverlay text="PawPal" />;
}

