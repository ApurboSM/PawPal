import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

type Rect = { left: number; top: number; width: number; height: number };

/**
 * Measures the active item's box relative to its container.
 *
 * Re-measures on resize, on font load and whenever the item set changes, so the
 * capsule cannot drift out of alignment when nav entries appear (the Admin link)
 * or when label widths settle after a web font arrives.
 */
export function useCapsuleRect(
  containerRef: RefObject<HTMLElement>,
  itemRefs: RefObject<Array<HTMLElement | null>>,
  activeIndex: number,
  itemCount: number,
) {
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const item = activeIndex >= 0 ? itemRefs.current?.[activeIndex] : null;
    if (!container || !item) {
      setRect(null);
      return;
    }

    const c = container.getBoundingClientRect();
    const i = item.getBoundingClientRect();
    const next = {
      left: i.left - c.left,
      top: i.top - c.top,
      width: i.width,
      height: i.height,
    };

    setRect((prev) =>
      prev &&
      Math.abs(prev.left - next.left) < 0.5 &&
      Math.abs(prev.top - next.top) < 0.5 &&
      Math.abs(prev.width - next.width) < 0.5 &&
      Math.abs(prev.height - next.height) < 0.5
        ? prev
        : next,
    );
  }, [containerRef, itemRefs, activeIndex]);

  // Layout effect: measure in the same frame the active item changes, so the
  // capsule never paints at a stale position first.
  useLayoutEffect(() => {
    measure();
  }, [measure, itemCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    for (const item of itemRefs.current ?? []) if (item) observer.observe(item);

    window.addEventListener("resize", measure);
    document.fonts?.ready.then(() => measure()).catch(() => {});

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, itemRefs, measure]);

  return rect;
}

type NavCapsuleProps = {
  rect: Rect | null;
  className?: string;
  radius: number;
  /** Horizontal inset in px. Negative grows the pill wider than the measured box. */
  insetX?: number;
  /** Vertical inset in px. Negative grows the pill taller than the measured box. */
  insetY?: number;
  /** Nudge up/down after insets, e.g. to keep an icon pill clear of its label. */
  offsetY?: number;
};

/**
 * A single capsule that slides between nav items.
 *
 * Two deliberate choices, both measured:
 *
 * 1. One persistent element, not one-per-item with `layoutId`. Layout projection
 *    has to measure after the incoming page commits, which is exactly when the
 *    main thread is busiest.
 *
 * 2. A CSS transition on `transform`, not a JS animation. Framer (like any
 *    rAF-driven library) animates on the main thread, so the incoming route's
 *    render — measured at 94ms for the appointments page — freezes the capsule
 *    mid-flight and it lands with a visible jump. Transform transitions run on
 *    the compositor and keep gliding while JS is blocked.
 *
 * Width is applied instantly rather than transitioned: width is a layout property
 * and cannot be composited, so animating it would reintroduce the stutter. The
 * pill takes its destination width as it starts travelling, which reads fine
 * because the movement carries the eye.
 */
export function NavCapsule({
  rect,
  className,
  radius,
  insetX = 0,
  insetY = 0,
  offsetY = 0,
}: NavCapsuleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hasPositioned = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !rect) return;

    const x = rect.left + insetX;
    const y = rect.top + insetY + offsetY;
    const width = Math.max(rect.width - insetX * 2, 0);
    const height = Math.max(rect.height - insetY * 2, 0);

    // The very first placement must not glide in from the corner.
    if (!hasPositioned.current) {
      el.style.transition = "none";
      el.style.opacity = "0";
    }

    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    if (!hasPositioned.current) {
      // Force a style flush so the untransitioned position is committed before
      // transitions are switched back on.
      void el.offsetWidth;
      el.style.transition = "";
      el.style.opacity = "1";
      hasPositioned.current = true;
    }
  }, [rect, insetX, insetY, offsetY]);

  useEffect(() => {
    if (!rect) hasPositioned.current = false;
  }, [rect]);

  if (!rect) return null;

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn("nav-capsule pointer-events-none absolute left-0 top-0 z-0", className)}
      style={{ borderRadius: radius }}
    />
  );
}
