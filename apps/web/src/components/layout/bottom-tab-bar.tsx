import { Link, useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, PawPrint, Siren, BookOpen, CalendarDays, type LucideIcon } from "lucide-react";

type Tab = {
  name: string;
  /** Shorter label so five tabs still fit at 320px. */
  shortName: string;
  path: string;
  icon: LucideIcon;
  emphasis?: boolean;
};

const TABS: Tab[] = [
  { name: "Home", shortName: "Home", path: "/", icon: Home },
  { name: "Adopt", shortName: "Adopt", path: "/pets", icon: PawPrint },
  { name: "Emergency", shortName: "SOS", path: "/emergency", icon: Siren, emphasis: true },
  { name: "Resources", shortName: "Guides", path: "/resources", icon: BookOpen },
  { name: "Book Appointment", shortName: "Book", path: "/appointments", icon: CalendarDays },
];

/** Matches a tab for nested routes too, e.g. /pets/12 keeps "Adopt" active. */
function isTabActive(tabPath: string, location: string) {
  if (tabPath === "/") return location === "/";
  return location === tabPath || location.startsWith(`${tabPath}/`);
}

export function BottomTabBar() {
  const [location] = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="glass-bar mx-3 mb-3 flex items-stretch gap-0.5 rounded-[26px] p-1.5">
        {TABS.map((tab) => {
          const isActive = isTabActive(tab.path, location);
          const Icon = tab.icon;

          return (
            <li key={tab.path} className="min-w-0 flex-1">
              <Link
                href={tab.path}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.name}
                className={cn(
                  "relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-[20px] px-0.5 py-1.5",
                  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                  tab.emphasis
                    ? isActive
                      ? "text-red-600"
                      : "text-red-500"
                    : isActive
                      ? "text-primary"
                      : "text-muted-foreground",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="bottom-tab-capsule"
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                    className={cn(
                      "glass-capsule absolute inset-0 -z-10 rounded-[20px]",
                      tab.emphasis && "!border-red-200/80",
                    )}
                  />
                )}

                <span
                  className={cn(
                    "flex items-center justify-center rounded-full transition-transform duration-200",
                    tab.emphasis && "bg-red-500/10 p-1",
                    tab.emphasis && isActive && "bg-red-500/15",
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5", tab.emphasis && "h-[1.35rem] w-[1.35rem]")}
                    aria-hidden="true"
                  />
                </span>

                <span
                  className={cn(
                    "w-full truncate text-center text-[0.65rem] font-medium leading-tight",
                    isActive && "font-semibold",
                  )}
                >
                  {tab.shortName}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
