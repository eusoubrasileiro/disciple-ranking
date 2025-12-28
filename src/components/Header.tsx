import { Shield, BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 royal-gradient border-b border-gold/20">
      <div className="container flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 border border-accent/40">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-display font-semibold text-primary-foreground leading-tight">
              Embaixadores do Rei
            </h1>
            <p className="text-xs text-primary-foreground/70">
              Primeira Igreja Batista de Confins (MG)
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className={`border-accent/40 ${
                location.pathname === '/'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Home className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Ranking</span>
            </Button>
          </Link>

          <Link to="/versiculos">
            <Button
              variant="outline"
              size="sm"
              className={`border-accent/40 ${
                location.pathname === '/versiculos'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Versículos</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
