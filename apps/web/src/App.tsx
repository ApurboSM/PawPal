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
import { ROUTE_IMPORTS, PRIMARY_ROUTES, prefetchRoute } from "@/lib/route-imports";

// Pages. The five bottom-tab routes reuse the shared loaders from
// lib/route-imports so a prefetch and the lazy render share one download.
const HomePage = lazy(ROUTE_IMPORTS["/"] as () => Promise<{ default: React.ComponentType }>);
const AuthPage = lazy(ROUTE_IMPORTS["/auth"] as () => Promise<{ default: React.ComponentType }>);
const PetsPage = lazy(ROUTE_IMPORTS["/pets"] as () => Promise<{ default: React.ComponentType }>);
const ResourcesPage = lazy(ROUTE_IMPORTS["/resources"] as () => Promise<{ default: React.ComponentType }>);
const EmergencyPage = lazy(ROUTE_IMPORTS["/emergency"] as () => Promise<{ default: React.ComponentType }>);
const AppointmentPage = lazy(ROUTE_IMPORTS["/appointments"] as () => Promise<{ default: React.ComponentType }>);
const ContactPage = lazy(ROUTE_IMPORTS["/contact"] as () => Promise<{ default: React.ComponentType }>);
const ProfilePage = lazy(ROUTE_IMPORTS["/profile"] as () => Promise<{ default: React.ComponentType }>);
const AdminPage = lazy(ROUTE_IMPORTS["/admin"] as () => Promise<{ default: React.ComponentType }>);
const PetRegisterPage = lazy(ROUTE_IMPORTS["/pets/register"] as () => Promise<{ default: React.ComponentType }>);

const PetDetailPage = lazy(() => import("@/pages/pet-detail-page"));
const ResourceDetailPage = lazy(() => import("@/pages/resource-detail-page"));
const AppointmentDetailPage = lazy(() => import("@/pages/appointment-detail-page"));
const PrivacyPolicyPage = lazy(() => import("@/pages/privacy-policy-page"));
const TermsOfServicePage = lazy(() => import("@/pages/terms-of-service-page"));
const CookiePolicyPage = lazy(() => import("@/pages/cookie-policy-page"));
const NotFound = lazy(() => import("@/pages/not-found"));

const ChatWidget = lazy(() =>
  import("@/components/ui/chat-widget").then((m) => ({ default: m.ChatWidget })),
);

// wouter's `Route` typing expects a plain component function, not a lazy exotic component.
const HomePageRoute = () => <HomePage />;
const AuthPageRoute = () => <AuthPage />;
const PetsPageRoute = () => <PetsPage />;
const PetDetailPageRoute = () => <PetDetailPage />;
const ResourcesPageRoute = () => <ResourcesPage />;
const ResourceDetailPageRoute = () => <ResourceDetailPage />;
const AppointmentPageRoute = () => <AppointmentPage />;
const AppointmentDetailPageRoute = () => <AppointmentDetailPage />;
const AdminPageRoute = () => <AdminPage />;
const ContactPageRoute = () => <ContactPage />;
const PrivacyPolicyPageRoute = () => <PrivacyPolicyPage />;
const TermsOfServicePageRoute = () => <TermsOfServicePage />;
const CookiePolicyPageRoute = () => <CookiePolicyPage />;
const EmergencyPageRoute = () => <EmergencyPage />;
const ProfilePageRoute = () => <ProfilePage />;
const PetRegisterPageRoute = () => <PetRegisterPage />;
const NotFoundRoute = () => <NotFound />;

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
      <Suspense fallback={<RouteSkeletonFallback />}>
        <AnimatePresence mode="sync" initial={false}>
          <motion.div key={location} {...pageMotion}>
            <Router />
          </motion.div>
        </AnimatePresence>
      </Suspense>

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
