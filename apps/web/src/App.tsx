import { Suspense, lazy, useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/use-auth";
import { HelmetProvider } from "react-helmet-async";
import { RouteLoadingOverlay } from "@/components/layout/route-loading-overlay";
import { PawLoadingOverlay } from "@/components/ui/paw-loading-overlay";

// Pages
const HomePage = lazy(() => import("@/pages/home-page"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const PetsPage = lazy(() => import("@/pages/pets-page"));
const PetDetailPage = lazy(() => import("@/pages/pet-detail-page"));
const ResourcesPage = lazy(() => import("@/pages/resources-page"));
const ResourceDetailPage = lazy(() => import("@/pages/resource-detail-page"));
const AppointmentPage = lazy(() => import("@/pages/appointment-page"));
const AdminPage = lazy(() => import("@/pages/admin-page"));
const ContactPage = lazy(() => import("@/pages/contact-page"));
const EmergencyPage = lazy(() => import("@/pages/emergency-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const PetRegisterPage = lazy(() => import("@/pages/pet-register-page"));
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
const AdminPageRoute = () => <AdminPage />;
const ContactPageRoute = () => <ContactPage />;
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
      <ProtectedRoute path="/profile" component={ProfilePageRoute} />
      <ProtectedRoute path="/admin" component={AdminPageRoute} />
      <Route path="/contact" component={ContactPageRoute} />
      {/* Fallback to 404 */}
      <Route component={NotFoundRoute} />
    </Switch>
  );
}

function App() {
  const [mountChat, setMountChat] = useState(false);

  // Defer chat widget loading until the browser is idle to keep first paint fast.
  useEffect(() => {
    let cancelled = false;
    const w = window as any;
    const idleCb =
      typeof w.requestIdleCallback === "function"
        ? w.requestIdleCallback(() => !cancelled && setMountChat(true))
        : setTimeout(() => !cancelled && setMountChat(true), 1500);

    return () => {
      cancelled = true;
      if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idleCb);
      else clearTimeout(idleCb);
    };
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <RouteLoadingOverlay />
            <Suspense fallback={<PawLoadingOverlay text="PawPal" />}>
              <Router />
            </Suspense>
            {mountChat && (
              <Suspense fallback={null}>
                <ChatWidget />
              </Suspense>
            )}
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
