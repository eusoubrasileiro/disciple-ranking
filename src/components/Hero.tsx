import { Star, Crown, Calendar } from 'lucide-react';

interface HeroProps {
  season: string;
  updatedAt: string;
  totalParticipants: number;
}

export function Hero({ season, updatedAt, totalParticipants }: HeroProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="relative pt-24 pb-16 royal-gradient overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 opacity-10">
          <Star className="w-8 h-8 text-accent animate-float" />
        </div>
        <div className="absolute top-32 right-8 opacity-10">
          <Star className="w-6 h-6 text-accent animate-float animation-delay-200" />
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-10">
          <Star className="w-5 h-5 text-accent animate-float animation-delay-100" />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-5">
          <Crown className="w-16 h-16 text-accent" />
        </div>
      </div>

      <div className="container relative px-4">
        <div className="flex flex-col items-center text-center">
          {/* Shield emblem */}
          <div className="relative mb-6 animate-fade-in">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl scale-150" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-accent/50 bg-royal-dark/50 backdrop-blur-sm">
              <img src="/Insignia-ER.png" alt="Embaixadores do Rei" className="w-20 h-20 object-contain" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2 mb-6 animate-fade-in animation-delay-100">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground">
              Embaixadores do Rei
            </h1>
            <p className="text-lg text-accent font-medium">
              Gincana Anual • Temporada {season}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-6 animate-fade-in animation-delay-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{totalParticipants}</p>
              <p className="text-xs text-primary-foreground/70 uppercase tracking-wide">Participantes</p>
            </div>
            <div className="w-px h-10 bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground">{season}</p>
              <p className="text-xs text-primary-foreground/70 uppercase tracking-wide">Temporada</p>
            </div>
          </div>

          {/* Updated at */}
          <div className="flex items-center gap-2 text-sm text-primary-foreground/60 animate-fade-in animation-delay-300">
            <Calendar className="w-4 h-4" />
            <span>Atualizado em: {formatDate(updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 80V40C240 0 480 0 720 20C960 40 1200 80 1440 60V80H0Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
