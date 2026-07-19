import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !user ? (
        // Preserve the destination so login can hand the user back to it.
        <Redirect to={`/auth?next=${encodeURIComponent(path)}`} />
      ) : path === "/admin" && user.role !== "admin" ? (
        <Redirect to="/" />
      ) : (
        <Component />
      )}
    </Route>
  );
}
