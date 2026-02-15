import { Link, useLocation } from 'react-router-dom';
import { Database } from 'lucide-react';
import { useAppConfig } from '@/ConfigProvider';

export function DataFab() {
  const location = useLocation();
  const config = useAppConfig();

  // Hide on the dados page itself, or if feature is disabled
  if (location.pathname === '/dados' || !config?.features?.dataViewer) {
    return null;
  }

  return (
    <Link
      to="/dados"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 group"
      title="Ver dados brutos"
    >
      <div className="relative">
        {/* Ping/pulse ring */}
        <span className="absolute inset-0 rounded-full bg-accent/40 animate-pulse" />
        {/* Glow effect */}
        <span className="absolute -inset-1 rounded-full bg-accent/20 blur-md group-hover:bg-accent/30 transition-colors" />
        {/* Button */}
        <div className="relative flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground font-semibold shadow-gold border-2 border-accent/60 hover:scale-110 hover:shadow-elevated transition-all duration-300">
          <Database className="w-5 h-5 animate-float" />
          <span className="text-sm hidden sm:inline">Dados</span>
        </div>
      </div>
    </Link>
  );
}
