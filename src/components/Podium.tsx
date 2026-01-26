import { Crown, Medal } from 'lucide-react';
import { PointsDelta } from '@/components/PointsDelta';
import type { ParticipantWithPoints } from '@/hooks/useLeaderboardData';

interface PodiumProps {
  participants: ParticipantWithPoints[];
}

export function Podium({ participants }: PodiumProps) {
  const top3 = participants.slice(0, 3);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return null;
    }
  };

  const getPositionStyles = (position: number) => {
    switch (position) {
      case 0:
        return 'card-gold bg-gradient-to-br from-accent/5 to-accent/15 order-2 sm:order-1 scale-105 sm:scale-110 z-10';
      case 1:
        return 'card-royal order-1 sm:order-2';
      case 2:
        return 'card-royal order-3';
      default:
        return 'card-royal';
    }
  };

  return (
    <section className="py-12 px-4 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Destaques</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Top 3 — Pódio
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
          {top3.map((participant, index) => (
            <div
              key={participant.id}
              className={`w-full sm:w-1/3 p-6 rounded-xl text-center transition-transform duration-300 hover:-translate-y-1 animate-fade-in ${getPositionStyles(index)}`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Medal */}
              <div className="text-4xl mb-3">{getMedalIcon(index)}</div>
              
              {/* Position badge */}
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-3 text-sm font-bold
                ${index === 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                {index + 1}º
              </div>
              
              {/* Name */}
              <h3 className={`font-display font-semibold text-lg mb-2 truncate
                ${index === 0 ? 'text-accent-foreground' : 'text-foreground'}`}>
                {participant.name}
              </h3>
              
              {/* Points */}
              <div className="flex items-center justify-center gap-1">
                <Medal className={`w-4 h-4 ${index === 0 ? 'text-accent' : 'text-primary'}`} />
                <span className={`text-2xl font-bold ${index === 0 ? 'text-accent' : 'text-primary'}`}>
                  {participant.points}
                </span>
                <span className="text-sm text-muted-foreground ml-1">pts</span>
              </div>

              {/* Points Delta */}
              {participant.pointsDelta !== undefined && participant.pointsDelta !== 0 && (
                <div className="mt-1">
                  <PointsDelta delta={participant.pointsDelta} size="md" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
