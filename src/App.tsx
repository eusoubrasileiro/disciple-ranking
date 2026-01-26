import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, useAppConfig } from "@/ConfigProvider";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import Versiculos from "./pages/Versiculos";
import Visitantes from "./pages/Visitantes";
import Jogos from "./pages/Jogos";
import Presenca from "./pages/Presenca";
import Bonus from "./pages/Bonus";
import NotFound from "./pages/NotFound";

// Only load Admin in development - not bundled in production
const Admin = import.meta.env.DEV ? lazy(() => import("./pages/Admin")) : null;

const queryClient = new QueryClient();

// Get base path from vite config (set at build time)
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '') || '/disciple-ranking/embaixadores-do-rei';

function AppRoutes() {
  const config = useAppConfig();
  const features = config?.features;

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      {features?.bibleVerses && <Route path="/versiculos" element={<Versiculos />} />}
      {features?.visitorTracking && <Route path="/visitantes" element={<Visitantes />} />}
      {features?.games && <Route path="/jogos" element={<Jogos />} />}
      {features?.attendanceCalendar && <Route path="/presenca" element={<Presenca />} />}
      {features?.bonusPoints && <Route path="/bonus" element={<Bonus />} />}
      {import.meta.env.DEV && Admin && (
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
              <Admin />
            </Suspense>
          }
        />
      )}
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter basename={basePath}>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
