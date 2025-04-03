
import { NavLink } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-background border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-r from-flexifit-blue to-flexifit-teal flex items-center justify-center text-white font-bold">F</div>
              <span className="text-xl font-bold gradient-text">Flexifit</span>
            </div>
            <p className="mt-2 text-sm text-foreground/70">Your personalized workout companion</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <NavLink to="/" className="text-foreground/70 hover:text-primary transition-colors">
              Home
            </NavLink>
            <NavLink to="/chatbot" className="text-foreground/70 hover:text-primary transition-colors">
              Chatbot
            </NavLink>
            <NavLink to="/dashboard" className="text-foreground/70 hover:text-primary transition-colors">
              Dashboard
            </NavLink>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-foreground/70">© {new Date().getFullYear()} Flexifit. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
