import { useRef } from "react";
import { useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { prefetchRoute } from "@/lib/route-imports";
import { useRouteTransition, shouldHandleClick } from "@/lib/route-transition";
import { isNavItemActive, navHref, useNavIntent, deferNavigation } from "@/lib/nav-state";
import { NavCapsule, useCapsuleRect } from "@/components/layout/nav-capsule";
import { Home, PawPrint, Siren, BookOpen, CalendarDays, type LucideIcon } from "lucide-react";

type Tab = {
  name: string;
  /** Shorter label so five tabs still fit at 320px. */
  shortName: string;
  path: string;
  icon: LucideIcon;
  emphasis?: boolean;
  /** Long labels need a smaller type size to survive a 320px viewport. */
  compactLabel?: boolean;
};

const TABS: Tab[] = [
  { name: "Home", shortName: "Home", path: "/", icon: Home },
  { name: "Adopt", shortName: "Adopt", path: "/pets", icon: PawPrint },
  { name: "Emergency", shortName: "SOS", path: "/emergency", icon: Siren, emphasis: true },
  { name: "Resources", shortName: "Guides", path: "/resources", icon: BookOpen },
  {
    name: "Appointments",
    shortName: "Appointments",
    path: "/appointments",
    icon: CalendarDays,
    compactLabel: true,
  },
];

const TAB_PATHS = TABS.map((tab) => tab.path);

export function BottomTabBar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { navigateTo } = useRouteTransition();
  const prefersReducedMotion = useReducedMotion();

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  const search = typeof window === "undefined" ? "" : window.location.search;
  const { activePath, setIntent } = useNavIntent(location, search, TAB_PATHS);
  const activeIndex = TABS.findIndex((tab) => tab.path === activePath);
  const capsuleRect = useCapsuleRect(listRef, itemRefs, activeIndex, TABS.length);

  const activeTab = activeIndex >= 0 ? TABS[activeIndex] : null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul
        ref={listRef}
        className="glass-bar relative mx-3 mb-3 flex items-stretch gap-0.5 rounded-[26px] p-1.5"
      >
        {/* Full tab height; narrowed horizontally just enough to leave a gap
            between neighbours while still containing the widest label. */}
        <NavCapsule
          rect={capsuleRect}
          radius={18}
          insetX={4}
          insetY={0}
          className={cn("glass-capsule", activeTab?.emphasis && "!border-red-200/80")}
        />

        {TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          const href = navHref(tab.path, Boolean(user));
          const Icon = tab.icon;

          return (
            <li
              key={tab.path}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="min-w-0 flex-1"
            >
              <a
                href={href}
                aria-current={isNavItemActive(location, search, tab.path) ? "page" : undefined}
                aria-label={tab.name}
                onClick={(event) => {
                  if (!shouldHandleClick(event)) return;
                  event.preventDefault();
                  // Move the capsule now, navigate on the next frame so the
                  // indicator paints before the new page's render blocks it.
                  setIntent(tab.path);
                  deferNavigation(() => navigateTo(href));
                }}
                // Warm the chunk as the finger lands, before the tap completes.
                onPointerEnter={() => prefetchRoute(tab.path)}
                onTouchStart={() => prefetchRoute(tab.path)}
                className={cn(
                  "group relative z-10 flex min-h-[58px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[16px] px-0.5 py-1.5",
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
                {/* Hover/press wash for the inactive tabs, so every tab reacts to touch. */}
                {!isActive && (
                  <span
                    className={cn(
                      "absolute inset-x-2 inset-y-1 -z-10 rounded-[16px] opacity-0 transition-opacity duration-200",
                      "group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100",
                      tab.emphasis ? "bg-red-500/10" : "bg-primary/10",
                    )}
                  />
                )}

                <motion.span
                  animate={
                    prefersReducedMotion ? {} : { scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }
                  }
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
                    "w-full truncate text-center leading-tight",
                    tab.compactLabel
                      ? "text-[0.55rem] tracking-tight max-[359px]:text-[0.48rem]"
                      : "text-[0.7rem]",
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
