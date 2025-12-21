import { Shield, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const scrollToRanking = () => {
    document.getElementById('ranking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 royal-gradient border-b border-gold/20">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
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
        </div>
        
        <Button
          onClick={scrollToRanking}
          variant="outline"
          size="sm"
          className="border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground"
        >
          Ver Ranking
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </header>
  );
}
