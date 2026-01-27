import { type ReactNode, useEffect, useRef, useState } from "react";

type LazyMountProps = {
  children: ReactNode;
  /** How far outside the viewport we should start loading, e.g. "600px" */
  rootMargin?: string;
  /** Placeholder to keep layout stable before mounting */
  placeholder?: ReactNode;
};

export function LazyMount({
  children,
  rootMargin = "600px",
  placeholder = null,
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const el = ref.current;
    if (!el) return;

    // If IO isn't available, just mount immediately.
    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [mounted, rootMargin]);

  return <div ref={ref}>{mounted ? children : placeholder}</div>;
}

