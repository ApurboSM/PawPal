import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Menu, PawPrint, Heart, Cat 
} from "lucide-react";

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md transition-all-ease">
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center bg-primary/10 rounded-full p-2 group-hover:bg-primary/20 transition-all duration-300">
              <PawPrint className="h-6 w-6 text-primary group-hover:scale-110 transition-all duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">PawPal</span>
              <span className="text-xs text-muted-foreground -mt-1">Where Every Tail Finds a Tale</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${
                  location === item.path
                    ? "text-primary font-medium after:bg-primary"
                    : "text-foreground hover:text-primary font-medium after:bg-transparent"
                } relative py-1 transition-all-ease after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded after:transition-all after:duration-300 hover:after:bg-primary/40`}
              >
                {item.name}
              </Link>
            ))}
            {user && user.role === "admin" && (
              <Link
                href="/admin"
                className={`${
                  location === "/admin"
                    ? "text-primary font-medium after:bg-primary"
                    : "text-foreground hover:text-primary font-medium after:bg-transparent"
                } relative py-1 transition-all-ease after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded after:transition-all after:duration-300 hover:after:bg-primary/40`}
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
                <div className="flex items-center space-x-2 bg-muted py-1 px-3 rounded-full text-foreground">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="font-medium">Hello, {user.name}</span>
                </div>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/20 hover:text-primary hover:border-primary rounded-full transition-all duration-300"
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
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary/20 hover:text-primary hover:border-primary rounded-full transition-all duration-300"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button 
                    className="bg-primary text-white hover:bg-primary/90 hover:shadow-lg rounded-full transition-all duration-300"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-primary p-2 rounded-full hover:bg-primary/10 transition-all duration-300" 
            onClick={toggleMenu}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="flex flex-col space-y-4 pt-4 pb-3 border-t mt-3 border-primary/20">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    location === item.path
                      ? "text-primary font-medium bg-primary/10 rounded-lg pl-4 py-2"
                      : "text-foreground hover:text-primary font-medium hover:bg-primary/5 rounded-lg pl-4 py-2"
                  } transition-all duration-200`}
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
                      ? "text-primary font-medium bg-primary/10 rounded-lg pl-4 py-2"
                      : "text-foreground hover:text-primary font-medium hover:bg-primary/5 rounded-lg pl-4 py-2"
                  } transition-all duration-200`}
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
                  <div className="flex items-center space-x-2 bg-muted py-2 px-4 rounded-lg">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-medium">Hello, {user.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/20 rounded-full w-full transition-all duration-300"
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
                <div className="flex flex-col space-y-3 pt-2">
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary/20 rounded-full w-full transition-all duration-300"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      className="bg-primary text-white hover:bg-primary/90 rounded-full w-full transition-all duration-300"
                    >
                      <Heart className="h-4 w-4 mr-1" />
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
