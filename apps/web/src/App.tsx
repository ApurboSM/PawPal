import { Suspense, lazy, useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/use-auth";
import { HelmetProvider } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RouteSkeletonFallback } from "@/components/layout/route-loading-overlay";
import { RouteProgress } from "@/components/layout/route-progress";
import { RouteTransitionProvider } from "@/lib/route-transition";
import {
  ROUTES,
  PRIMARY_ROUTES,
  prefetchRoute,
  PET_DETAIL_ROUTE,
  RESOURCE_DETAIL_ROUTE,
  APPOINTMENT_DETAIL_ROUTE,
  NOT_FOUND_ROUTE,
} from "@/lib/route-imports";

const ChatWidget = lazy(() =>
  import("@/components/ui/chat-widget").then((m) => ({ default: m.ChatWidget })),
);

// wouter's `Route` typing expects a plain component function.
const HomePageRoute = ROUTES["/"];
const AuthPageRoute = ROUTES["/auth"];
const PetsPageRoute = ROUTES["/pets"];
const PetDetailPageRoute = PET_DETAIL_ROUTE;
const ResourcesPageRoute = ROUTES["/resources"];
const ResourceDetailPageRoute = RESOURCE_DETAIL_ROUTE;
const AppointmentPageRoute = ROUTES["/appointments"];
const AppointmentDetailPageRoute = APPOINTMENT_DETAIL_ROUTE;
const AdminPageRoute = ROUTES["/admin"];
const ContactPageRoute = ROUTES["/contact"];
const PrivacyPolicyPageRoute = ROUTES["/privacy-policy"];
const TermsOfServicePageRoute = ROUTES["/terms-of-service"];
const CookiePolicyPageRoute = ROUTES["/cookie-policy"];
const EmergencyPageRoute = ROUTES["/emergency"];
const ProfilePageRoute = ROUTES["/profile"];
const PetRegisterPageRoute = ROUTES["/pets/register"];
const NotFoundRoute = NOT_FOUND_ROUTE;

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePageRoute} />
      <Route path="/auth" component={AuthPageRoute} />
      <Route path="/pets" component={PetsPageRoute} />
      <ProtectedRoute path="/pets/register" component={PetRegisterPageRoute} />
      <Route path="/pets/:id" component={PetDetailPageRoute} />
      <Route path="/resources" component={ResourcesPageRoute} />
      <Route path="/resources/:id" component={ResourceDetailPageRoute} />
      <Route path="/emergency" component={EmergencyPageRoute} />
      <ProtectedRoute path="/appointments" component={AppointmentPageRoute} />
      <ProtectedRoute path="/appointments/:id" component={AppointmentDetailPageRoute} />
      <ProtectedRoute path="/profile" component={ProfilePageRoute} />
      <ProtectedRoute path="/admin" component={AdminPageRoute} />
      <Route path="/contact" component={ContactPageRoute} />
      <Route path="/privacy-policy" component={PrivacyPolicyPageRoute} />
      <Route path="/terms-of-service" component={TermsOfServicePageRoute} />
      <Route path="/cookie-policy" component={CookiePolicyPageRoute} />
      {/* Fallback to 404 */}
      <Route component={NotFoundRoute} />
    </Switch>
  );
}

/** Scrolls to the top on route change, the one bit of "page load" worth keeping. */
function ScrollToTop({ location }: { location: string }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location]);
  return null;
}

function AppShell() {
  const [location] = useLocation();
  const [mountChat, setMountChat] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Defer the chat widget and warm the primary route chunks once the browser is idle,
  // so the first tap on a tab has nothing left to download.
  useEffect(() => {
    let cancelled = false;
    const w = window as any;

    const onIdle = () => {
      if (cancelled) return;
      setMountChat(true);
      PRIMARY_ROUTES.forEach(prefetchRoute);
    };

    const idleCb =
      typeof w.requestIdleCallback === "function"
        ? w.requestIdleCallback(onIdle)
        : setTimeout(onIdle, 1500);

    return () => {
      cancelled = true;
      if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idleCb);
      else clearTimeout(idleCb);
    };
  }, []);

  // Enter-only. An exit animation would make every switch wait for the old page
  // to fade out before the new one starts — that delay is what reads as lag.
  const pageMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <>
      {/* Chrome renders once and stays mounted, so navigating never tears it down. */}
      <Navbar />
      <RouteProgress />

      <ScrollToTop location={location} />

      {/* Suspense stays OUTSIDE the keyed wrapper. Inside, every navigation would
          mount a brand-new boundary, and a fresh boundary always shows its
          fallback — that skeleton flash is what reads as a page reload. With one
          stable boundary, a navigation started in a transition keeps the current
          page on screen until the next chunk is ready. */}
      {/* The navbar is fixed, so it contributes no layout space. Reserve its
          height here; sections that want to run under it (the home hero) cancel
          this with a negative margin via the .bleed-under-nav utility. */}
      <div style={{ paddingTop: "var(--nav-h)" }}>
        <Suspense fallback={<RouteSkeletonFallback />}>
          <AnimatePresence mode="sync" initial={false}>
            <motion.div key={location} {...pageMotion}>
              <Router />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>

      <Footer />

      {mountChat && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <RouteTransitionProvider>
              <AppShell />
            </RouteTransitionProvider>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
