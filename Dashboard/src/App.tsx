import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { verifyToken } from "@/services/authService";
import { logout } from "@/services/logoutService";
import { PrivateRoute } from "@/components/PrivateRoute";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Classes from "./pages/Classes";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Access from "./pages/Users";
import Login from "./pages/Login";

const queryClient = new QueryClient();

// ✅ Layout padrão para páginas logadas
const AppLayout = () => {
  // controla se o sidebar está expandido
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const sidebarWidth = sidebarExpanded ? 310 : 70;

  const toggleSidebar = () => setSidebarExpanded(prev => !prev);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative">
        {/* Sidebar fixo */}
        <AppSidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />

        {/* Conteúdo principal deslocado para não ser sobreposto */}
        <div
          className="flex flex-col flex-1 transition-all duration-500"
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          <Header toggleSidebar={toggleSidebar} />
          <main className="flex-1 p-6 bg-muted/30 transition-all duration-500">
            <div className="mx-auto p-2 w-full">
              <Routes>
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/students"
                  element={
                    <PrivateRoute>
                      <Students />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/courses"
                  element={
                    <PrivateRoute>
                      <Courses />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/classes"
                  element={
                    <PrivateRoute>
                      <Classes />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <PrivateRoute>
                      <Payments />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <PrivateRoute>
                      <Reports />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/documents"
                  element={
                    <PrivateRoute>
                      <Documents />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/access"
                  element={
                    <PrivateRoute>
                      <Access />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// ✅ Subcomponente que roda *dentro* do BrowserRouter (agora pode usar useLocation)
const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (location.pathname === "/") return;

      const valid = await verifyToken();
      if (!valid && isMounted) {
        logout();
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  return (
    <Routes>
      {/* Tela de login sem layout */}
      <Route path="/" element={<Login />} />

      {/* Agrupa rotas com layout */}
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
