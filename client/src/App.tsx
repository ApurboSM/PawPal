import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./hooks/use-auth";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PetsPage from "@/pages/pets-page";
import PetDetailPage from "@/pages/pet-detail-page";
import ResourcesPage from "@/pages/resources-page";
import AppointmentPage from "@/pages/appointment-page";
import AdminPage from "@/pages/admin-page";
import ContactPage from "@/pages/contact-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/pets" component={PetsPage} />
      <Route path="/pets/:id" component={PetDetailPage} />
      <Route path="/resources" component={ResourcesPage} />
      <ProtectedRoute path="/appointments" component={AppointmentPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route path="/contact" component={ContactPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <TooltipProvider>
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
