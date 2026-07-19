import { useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { prefetchRoute } from "@/lib/route-imports";
import { useRouteTransition, shouldHandleClick } from "@/lib/route-transition";
import { Home, PawPrint, Siren, BookOpen, CalendarDays, type LucideIcon } from "lucide-react";

type Tab = {
  name: string;
  /** Shorter label so five tabs still fit at 320px. */
  shortName: string;
  path: string;
  icon: LucideIcon;
  emphasis?: boolean;
  /** Route is behind ProtectedRoute — signed-out users land on /auth instead. */
  requiresAuth?: boolean;
};

const TABS: Tab[] = [
  { name: "Home", shortName: "Home", path: "/", icon: Home },
  { name: "Adopt", shortName: "Adopt", path: "/pets", icon: PawPrint },
  { name: "Emergency", shortName: "SOS", path: "/emergency", icon: Siren, emphasis: true },
  { name: "Resources", shortName: "Guides", path: "/resources", icon: BookOpen },
  {
    name: "Book Appointment",
    shortName: "Book",
    path: "/appointments",
    icon: CalendarDays,
    requiresAuth: true,
  },
];

export function BottomTabBar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { navigateTo } = useRouteTransition();
  const prefersReducedMotion = useReducedMotion();

  const search = typeof window === "undefined" ? "" : window.location.search;
  const nextParam = new URLSearchParams(search).get("next");

  /** Nested routes keep their tab lit (/pets/12 -> Adopt). A signed-out user sent
   *  to /auth from a protected tab keeps that tab lit too, so the bar never goes
   *  blank and they can see where they were heading. */
  const isTabActive = (tab: Tab) => {
    if (location.startsWith("/auth")) {
      return Boolean(nextParam) && nextParam === tab.path;
    }
    if (tab.path === "/") return location === "/";
    return location === tab.path || location.startsWith(`${tab.path}/`);
  };

  const hrefFor = (tab: Tab) =>
    tab.requiresAuth && !user ? `/auth?next=${encodeURIComponent(tab.path)}` : tab.path;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="glass-bar mx-3 mb-3 flex items-stretch gap-0.5 rounded-[26px] p-1.5">
        {TABS.map((tab) => {
          const isActive = isTabActive(tab);
          const href = hrefFor(tab);
          const Icon = tab.icon;

          return (
            <li key={tab.path} className="min-w-0 flex-1">
              <a
                href={href}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.name}
                onClick={(event) => {
                  if (!shouldHandleClick(event)) return;
                  event.preventDefault();
                  navigateTo(href);
                }}
                // Warm the chunk as the finger lands, before the tap completes.
                onPointerEnter={() => prefetchRoute(tab.path)}
                onTouchStart={() => prefetchRoute(tab.path)}
                className={cn(
                  "group relative flex min-h-[58px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[20px] px-0.5 py-1.5",
                  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                  "active:scale-[0.97] motion-reduce:active:scale-100",
                  tab.emphasis
                    ? isActive
                      ? "text-red-600"
                      : "text-red-500 hover:text-red-600"
                    : isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="bottom-tab-capsule"
                    // Same curve as the desktop nav pill: fast start, no bounce-back.
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "tween", duration: 0.34, ease: [0.32, 0.72, 0, 1] }
                    }
                    style={{ borderRadius: 20 }}
                    className={cn(
                      "glass-capsule absolute inset-0 -z-10",
                      tab.emphasis && "!border-red-200/80",
                    )}
                  />
                )}

                {/* Hover/press wash for the inactive tabs, so every tab reacts to touch. */}
                {!isActive && (
                  <span
                    className={cn(
                      "absolute inset-0 -z-10 rounded-[20px] opacity-0 transition-opacity duration-200",
                      "group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100",
                      tab.emphasis ? "bg-red-500/10" : "bg-primary/10",
                    )}
                  />
                )}

                <motion.span
                  animate={
                    prefersReducedMotion ? {} : { scale: isActive ? 1.12 : 1, y: isActive ? -1 : 0 }
                  }
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className={cn(
                    "flex items-center justify-center rounded-full",
                    tab.emphasis && "bg-red-500/10 p-1",
                    tab.emphasis && isActive && "bg-red-500/20",
                  )}
                >
                  <Icon
                    className={cn("h-7 w-7", tab.emphasis && "h-[1.9rem] w-[1.9rem]")}
                    strokeWidth={isActive ? 2.6 : 2.2}
                    aria-hidden="true"
                  />
                </motion.span>

                <span
                  className={cn(
                    "w-full truncate text-center text-[0.7rem] leading-tight",
                    isActive ? "font-bold" : "font-semibold",
                  )}
                >
                  {tab.shortName}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
