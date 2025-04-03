
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import { ThemeToggle } from "../theme/theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const routes = [
    { name: "Home", path: "/" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Dashboard", path: "/dashboard" }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b">
      <div className="container flex items-center justify-between h-16 mx-auto px-4">
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-r from-flexifit-blue to-flexifit-teal flex items-center justify-center text-white font-bold">F</div>
            <span className="text-xl font-bold gradient-text">Flexifit</span>
          </NavLink>
        </div>
        
        <div className="hidden md:flex md:items-center md:gap-6">
          {routes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) => cn(
                "transition-colors hover:text-primary",
                isActive ? "text-primary font-medium" : "text-foreground/70"
              )}
            >
              {route.name}
            </NavLink>
          ))}

          <div className="flex items-center gap-2 ml-4">
            <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
              <NavLink to="/login">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </NavLink>
            </Button>
            <Button size="sm" asChild className="flex items-center gap-1">
              <NavLink to="/register">
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </NavLink>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-secondary md:hidden"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 shadow-lg bg-background border-b">
            {routes.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  isActive ? "text-white bg-primary" : "text-foreground/70 hover:bg-secondary"
                )}
              >
                {route.name}
              </NavLink>
            ))}
            
            {/* Mobile auth buttons */}
            <div className="flex flex-col gap-2 pt-2 pb-1">
              <Button variant="outline" asChild className="w-full justify-center">
                <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </NavLink>
              </Button>
              <Button asChild className="w-full justify-center">
                <NavLink to="/register" onClick={() => setIsMenuOpen(false)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </NavLink>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
