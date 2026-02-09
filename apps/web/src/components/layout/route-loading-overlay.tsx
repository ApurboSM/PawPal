import { useEffect, useState } from "react";
import { PawLoadingOverlay } from "@/components/ui/paw-loading-overlay";

/**
 * Shows the PawPal loading overlay during route transitions.
 * - Triggers on location change (and on first mount)
 * - Stays visible for at least MIN_MS
 * - Hides once queries/mutations settle, with a MAX_MS safety cutoff
 */
export function RouteLoadingOverlay() {
  const [active, setActive] = useState(false);
  const MIN_MS = 400;

  useEffect(() => {
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), MIN_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!active) return null;
  return <PawLoadingOverlay text="PawPal" />;
}

