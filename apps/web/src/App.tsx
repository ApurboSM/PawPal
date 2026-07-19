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

// Pages. Each importer is kept as a named function so it can be reused for
// prefetching — calling it twice is free, the module registry dedupes.
const importHome = () => import("@/pages/home-page");
const importAuth = () => import("@/pages/auth-page");
const importPets = () => import("@/pages/pets-page");
const importPetDetail = () => import("@/pages/pet-detail-page");
const importResources = () => import("@/pages/resources-page");
const importResourceDetail = () => import("@/pages/resource-detail-page");
const importAppointments = () => import("@/pages/appointment-page");
const importAppointmentDetail = () => import("@/pages/appointment-detail-page");
const importAdmin = () => import("@/pages/admin-page");
const importContact = () => import("@/pages/contact-page");
const importPrivacy = () => import("@/pages/privacy-policy-page");
const importTerms = () => import("@/pages/terms-of-service-page");
const importCookies = () => import("@/pages/cookie-policy-page");
const importEmergency = () => import("@/pages/emergency-page");
const importProfile = () => import("@/pages/profile-page");
const importPetRegister = () => import("@/pages/pet-register-page");
const importNotFound = () => import("@/pages/not-found");

/** Route path -> chunk loader, used by the nav to warm a chunk before the tap lands. */
export const ROUTE_IMPORTS: Record<string, () => Promise<unknown>> = {
  "/": importHome,
  "/auth": importAuth,
  "/pets": importPets,
  "/resources": importResources,
  "/emergency": importEmergency,
  "/appointments": importAppointments,
  "/contact": importContact,
  "/profile": importProfile,
  "/admin": importAdmin,
  "/pets/register": importPetRegister,
};

const HomePage = lazy(importHome);
const AuthPage = lazy(importAuth);
const PetsPage = lazy(importPets);
const PetDetailPage = lazy(importPetDetail);
const ResourcesPage = lazy(importResources);
const ResourceDetailPage = lazy(importResourceDetail);
const AppointmentPage = lazy(importAppointments);
const AppointmentDetailPage = lazy(importAppointmentDetail);
const AdminPage = lazy(importAdmin);
const ContactPage = lazy(importContact);
const PrivacyPolicyPage = lazy(importPrivacy);
const TermsOfServicePage = lazy(importTerms);
const CookiePolicyPage = lazy(importCookies);
const EmergencyPage = lazy(importEmergency);
const ProfilePage = lazy(importProfile);
const PetRegisterPage = lazy(importPetRegister);
const NotFound = lazy(importNotFound);

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
      for (const path of ["/", "/pets", "/emergency", "/resources", "/appointments"]) {
        ROUTE_IMPORTS[path]?.().catch(() => {});
      }
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

  const pageMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <>
      {/* Chrome renders once and stays mounted, so navigating never tears it down. */}
      <Navbar />

      <ScrollToTop location={location} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location} {...pageMotion}>
          <Suspense fallback={<RouteSkeletonFallback />}>
            <Router />
          </Suspense>
        </motion.div>
      </AnimatePresence>

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
            <AppShell />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
