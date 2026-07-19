import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Loader2, Menu, PawPrint, Heart, Cat, Stethoscope, LogOut } from "lucide-react";

type NavItem = { name: string; path: string };

const NAV_ITEMS: NavItem[] = [
  { name: "Home", path: "/" },
  { name: "Adopt", path: "/pets" },
  { name: "Resources", path: "/resources" },
  { name: "Emergency", path: "/emergency" },
  { name: "Book Appointment", path: "/appointments" },
  { name: "Contact", path: "/contact" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const navItems = user?.role === "admin" ? [...NAV_ITEMS, { name: "Admin", path: "/admin" }] : NAV_ITEMS;

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

  const isEmergency = (path: string) => path === "/emergency";

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <motion.nav
        initial={prefersReducedMotion ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Main navigation"
        className={cn(
          "container mx-auto rounded-[28px] border border-primary/15 bg-white/85 backdrop-blur-xl",
          "transition-[padding,box-shadow,background-color] duration-300 ease-out",
          isScrolled
            ? "bg-white/95 px-4 py-2 shadow-[0_14px_38px_-18px_rgba(255,105,180,0.55)] sm:px-6"
            : "px-4 py-3 shadow-[0_10px_30px_-20px_rgba(255,105,180,0.5)] sm:px-6",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="flex items-center justify-center rounded-full bg-primary/10 p-2 transition-colors duration-200 group-hover:bg-primary/20">
              <PawPrint className="h-6 w-6 text-primary" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                PawPal
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Where Every Tail Finds a Tale
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <ul className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <li key={item.path} className="relative">
                  <Link
                    href={item.path}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium",
                      "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      isEmergency(item.path)
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
                          "absolute inset-0 -z-10 rounded-full",
                          isEmergency(item.path) ? "bg-red-100" : "bg-primary/12",
                        )}
                      />
                    )}
                    {isEmergency(item.path) && <Stethoscope className="h-4 w-4" aria-hidden="true" />}
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop auth actions */}
          <div className="hidden items-center gap-2 xl:flex">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Loading account" />
            ) : user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <Heart className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="max-w-[10rem] truncate">Hello, {user.name}</span>
                </Link>
                <Link href="/pets/register">
                  <Button className="rounded-full transition-colors duration-200">
                    <Cat className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    List a Pet
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="rounded-full border-primary text-primary transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
                      Logging out
                    </>
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
                    className="rounded-full border-primary text-primary transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
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

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-haspopup="dialog"
            className="flex h-11 w-11 items-center justify-center rounded-full text-primary transition-colors duration-200 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 xl:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </motion.nav>

      <MobileNavDrawer
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        navItems={navItems}
        location={location}
        onLogout={handleLogout}
      />
    </header>
  );
}

type MobileNavDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navItems: NavItem[];
  location: string;
  onLogout: () => void;
};

function MobileNavDrawer({ open, onOpenChange, navItems, location, onLogout }: MobileNavDrawerProps) {
  const { user, isLoading, logoutMutation } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const close = () => onOpenChange(false);

  // Radix Dialog handles the slide-in, focus trap, Esc and scroll lock;
  // framer only staggers the contents once the panel is in place.
  const listMotion = prefersReducedMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
        variants: { visible: { transition: { staggerChildren: 0.045, delayChildren: 0.12 } } },
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
        className="flex w-[86%] flex-col gap-0 rounded-l-[28px] border-l-primary/15 bg-white p-0 sm:max-w-sm"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>

        <div className="flex items-center gap-2 border-b border-primary/10 px-5 py-5">
          <span className="flex items-center justify-center rounded-full bg-primary/10 p-2">
            <PawPrint className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold text-transparent">
            PawPal
          </span>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              aria-label="Mobile navigation"
              className="flex-1 overflow-y-auto px-4 py-5"
              {...listMotion}
            >
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = location === item.path;
                  const isEmergency = item.path === "/emergency";
                  return (
                    <motion.li key={item.path} {...itemMotion}>
                      <Link
                        href={item.path}
                        onClick={close}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex min-h-[44px] items-center gap-2 rounded-2xl px-4 py-3 text-base font-medium",
                          "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          isEmergency
                            ? isActive
                              ? "bg-red-100 text-red-700"
                              : "text-red-600 hover:bg-red-50"
                            : isActive
                              ? "bg-primary/12 text-primary"
                              : "text-foreground hover:bg-primary/5 hover:text-primary",
                        )}
                      >
                        {isEmergency && <Stethoscope className="h-4 w-4" aria-hidden="true" />}
                        {item.name}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>

        <div className="border-t border-primary/10 px-4 py-5">
          {isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Loading account" />
            </div>
          ) : user ? (
            <div className="flex flex-col gap-2.5">
              <Link
                href="/profile"
                onClick={close}
                className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-muted px-4 py-3 font-medium text-foreground transition-colors duration-200 hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Heart className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="truncate">Hello, {user.name}</span>
              </Link>
              <Link href="/pets/register" onClick={close}>
                <Button className="h-11 w-full rounded-full">
                  <Cat className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  List a Pet
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-11 w-full rounded-full border-primary text-primary hover:bg-primary/10 hover:text-primary"
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
                  className="h-11 w-full rounded-full border-primary text-primary hover:bg-primary/10 hover:text-primary"
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
