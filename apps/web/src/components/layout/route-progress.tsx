import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDelayedPending, useRouteTransition } from "@/lib/route-transition";

/**
 * Thin indeterminate bar shown while a route chunk is still downloading.
 *
 * It only appears once a navigation has been pending for ~140ms, so warm
 * (prefetched) routes switch with no loading affordance at all.
 */
export function RouteProgress() {
  const { isPending } = useRouteTransition();
  const visible = useDelayedPending(isPending);
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden"
          role="status"
          aria-live="polite"
          aria-label="Loading page"
        >
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary via-secondary to-primary"
            animate={prefersReducedMotion ? { opacity: 0.8 } : { x: ["-100%", "400%"] }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
