import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { prefetchRoute } from "@/lib/route-imports";
import { useRouteTransition, shouldHandleClick } from "@/lib/route-transition";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Menu,
  PawPrint,
  Heart,
  Cat,
  Stethoscope,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type NavItem = { name: string; path: string };

/** Full destination list — desktop only. Small screens get the five primary
 *  destinations from BottomTabBar and the rest from the account drawer. */
const NAV_ITEMS: NavItem[] = [
  { name: "Home", path: "/" },
  { name: "Adopt", path: "/pets" },
  { name: "Resources", path: "/resources" },
  { name: "Emergency", path: "/emergency" },
  { name: "Appointments", path: "/appointments" },
  { name: "Contact", path: "/contact" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();
  const { navigateTo } = useRouteTransition();
  const prefersReducedMotion = useReducedMotion();

  const navItems =
    user?.role === "admin" ? [...NAV_ITEMS, { name: "Admin", path: "/admin" }] : NAV_ITEMS;

  // Tighten the bar once the page scrolls so it reads as a floating pill.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
        <motion.nav
          initial={prefersReducedMotion ? false : { y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Main navigation"
          className={cn(
            "glass-panel container mx-auto rounded-[28px]",
            "transition-[padding,box-shadow] duration-300 ease-out",
            isScrolled ? "px-3 py-2 sm:px-6" : "px-3 py-2.5 sm:px-6 sm:py-3",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <Link
              href="/"
              className="group flex min-h-[44px] min-w-0 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className="flex flex-shrink-0 items-center justify-center rounded-full bg-primary/10 p-2 transition-colors duration-200 group-hover:bg-primary/20">
                <PawPrint className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate bg-gradient-to-r from-primary to-secondary bg-clip-text text-lg font-bold text-transparent sm:text-2xl">
                  PawPal
                </span>
                <span className="hidden truncate text-xs text-muted-foreground sm:block">
                  Where Every Tail Finds a Tale
                </span>
              </span>
            </Link>

            {/* Desktop navigation */}
            <ul className="hidden items-center gap-0.5 lg:flex xl:gap-1">
              {navItems.map((item) => {
                const isActive = location === item.path;
                const isEmergency = item.path === "/emergency";
                return (
                  <li key={item.path} className="relative">
                    <a
                      href={item.path}
                      aria-current={isActive ? "page" : undefined}
                      onPointerEnter={() => prefetchRoute(item.path)}
                      onClick={(event) => {
                        if (!shouldHandleClick(event)) return;
                        event.preventDefault();
                        navigateTo(item.path);
                      }}
                      className={cn(
                        "relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium",
                        "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isEmergency
                          ? "text-red-600 hover:text-red-700"
                          : isActive
                            ? "text-primary"
                            : "text-foreground hover:text-primary",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-pill"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          className={cn(
                            "glass-capsule-inset absolute inset-0 -z-10 rounded-full",
                            isEmergency && "glass-capsule-inset-danger",
                          )}
                        />
                      )}
                      {isEmergency && <Stethoscope className="h-4 w-4" aria-hidden="true" />}
                      {item.name}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Desktop auth actions */}
            <div className="hidden items-center gap-2 lg:flex">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Loading account" />
              ) : user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <Heart className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span className="max-w-[8rem] truncate xl:max-w-[10rem]">{user.name}</span>
                  </Link>
                  <Link href="/pets/register">
                    <Button className="rounded-full transition-colors duration-200">
                      <Cat className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      List a Pet
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="rounded-full border-primary bg-transparent text-primary transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      "Logout"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth?tab=login">
                    <Button
                      variant="outline"
                      className="rounded-full border-primary bg-transparent text-primary transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth?tab=register">
                    <Button className="rounded-full transition-colors duration-200">
                      <Heart className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Account / secondary menu trigger (small screens) */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open account menu"
              aria-expanded={isMenuOpen}
              aria-haspopup="dialog"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-primary transition-colors duration-200 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </motion.nav>
      </header>

      <AccountDrawer
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        location={location}
        onLogout={handleLogout}
      />

      <BottomTabBar />
    </>
  );
}

type AccountDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  onLogout: () => void;
};

/**
 * Secondary destinations only — the five primary ones live in BottomTabBar, so
 * duplicating them here would just be two navigations for the same thing.
 */
function AccountDrawer({ open, onOpenChange, location, onLogout }: AccountDrawerProps) {
  const { user, isLoading, logoutMutation } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const close = () => onOpenChange(false);

  const links = [
    ...(user ? [{ name: "My Profile", path: "/profile", icon: UserRound }] : []),
    { name: "Contact Us", path: "/contact", icon: Mail },
    ...(user?.role === "admin" ? [{ name: "Admin Dashboard", path: "/admin", icon: ShieldCheck }] : []),
  ];

  // Radix Dialog owns the slide-in, focus trap, Esc and scroll lock;
  // framer only staggers the contents once the panel is in place.
  const listMotion = prefersReducedMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
        variants: { visible: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } } },
      };

  const itemMotion = prefersReducedMotion
    ? {}
    : {
        variants: {
          hidden: { opacity: 0, x: 24 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
        },
      };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="glass-panel flex w-[86%] max-w-sm flex-col gap-0 rounded-l-[28px] !bg-transparent p-0"
      >
        <SheetTitle className="sr-only">Account menu</SheetTitle>

        <div className="flex items-center gap-2 border-b border-white/40 px-5 py-5">
          <span className="flex items-center justify-center rounded-full bg-primary/10 p-2">
            <PawPrint className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold text-transparent">
            PawPal
          </span>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div className="flex-1 overflow-y-auto px-4 py-5" {...listMotion}>
              {user && (
                <motion.div {...itemMotion} className="mb-4 rounded-2xl bg-white/50 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
                  <p className="truncate font-semibold text-foreground">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </motion.div>
              )}

              <nav aria-label="Account">
                <ul className="flex flex-col gap-1">
                  {links.map(({ name, path, icon: Icon }) => {
                    const isActive = location === path;
                    return (
                      <motion.li key={path} {...itemMotion}>
                        <Link
                          href={path}
                          onClick={close}
                          onPointerEnter={() => prefetchRoute(path)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex min-h-[44px] items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium",
                            "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            isActive
                              ? "bg-white/70 text-primary"
                              : "text-foreground hover:bg-white/50 hover:text-primary",
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                          {name}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="border-t border-white/40 px-4 py-5"
          style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Loading account" />
            </div>
          ) : user ? (
            <div className="flex flex-col gap-2.5">
              <Link href="/pets/register" onClick={close}>
                <Button className="h-11 w-full rounded-full">
                  <Cat className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  List a Pet
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-11 w-full rounded-full border-primary bg-transparent text-primary hover:bg-primary/10 hover:text-primary"
                onClick={onLogout}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                    Logging out
                  </>
                ) : (
                  <>
                    <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    Logout
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link href="/auth?tab=login" onClick={close}>
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-full border-primary bg-transparent text-primary hover:bg-primary/10 hover:text-primary"
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth?tab=register" onClick={close}>
                <Button className="h-11 w-full rounded-full">
                  <Heart className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
