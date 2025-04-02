
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme/theme-provider";
import { UserProvider } from "./contexts/UserContext";
import { ChatbotProvider } from "./contexts/ChatbotContext";
import { Navbar } from "./components/layout/navbar";
import { Footer } from "./components/layout/footer";

import Index from "./pages/Index";
import ChatbotPage from "./pages/ChatbotPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <UserProvider>
        <ChatbotProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/chatbot" element={<ChatbotPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ChatbotProvider>
      </UserProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
