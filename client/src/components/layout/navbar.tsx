import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, Menu, PawPrint } from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Adopt", path: "/pets" },
    { name: "Resources", path: "/resources" },
    { name: "Book Appointment", path: "/appointments" },
    { name: "Contact", path: "/contact" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-primary text-2xl">
              <PawPrint />
            </div>
            <span className="text-2xl font-bold text-primary">PawPal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${
                  location === item.path
                    ? "text-primary font-medium"
                    : "text-neutral-700 hover:text-primary font-medium"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {user && user.role === "admin" && (
              <Link
                href="/admin"
                className={`${
                  location === "/admin"
                    ? "text-primary font-medium"
                    : "text-neutral-700 hover:text-primary font-medium"
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : user ? (
              <>
                <span className="text-neutral-700 font-medium">Hello, {user.name}</span>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Logout"
                  )}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-primary text-white hover:bg-primary-dark">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-neutral-700" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="flex flex-col space-y-4 pt-4 pb-3 border-t mt-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    location === item.path
                      ? "text-primary font-medium"
                      : "text-neutral-700 hover:text-primary font-medium"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user && user.role === "admin" && (
                <Link
                  href="/admin"
                  className={`${
                    location === "/admin"
                      ? "text-primary font-medium"
                      : "text-neutral-700 hover:text-primary font-medium"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              
              {isLoading ? (
                <div className="flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : user ? (
                <>
                  <span className="text-neutral-700 font-medium">Hello, {user.name}</span>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white w-full"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Logout"
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex space-x-4 pt-2">
                  <Link href="/auth" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                    <Button className="bg-primary text-white hover:bg-primary-dark w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
