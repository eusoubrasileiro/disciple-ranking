import { Shield, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-8 px-4 bg-primary text-primary-foreground">
      <div className="container">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            <span className="font-display font-semibold">Embaixadores do Rei</span>
          </div>
          
          <p className="text-sm text-primary-foreground/70">
            Gincana Anual • Primeira Igreja Batista de Confins (MG)
          </p>
          
          <div className="flex items-center gap-2 text-xs text-primary-foreground/50">
            <Github className="w-3 h-3" />
            <span>Ranking alimentado por arquivo JSON no GitHub</span>
          </div>
          
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} — Site Público
          </p>
        </div>
      </div>
    </footer>
  );
}
