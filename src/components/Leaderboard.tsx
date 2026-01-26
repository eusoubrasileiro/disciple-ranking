import { useState } from 'react';
import { Search, Users, Medal, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PointsDelta } from '@/components/PointsDelta';
import type { ParticipantWithPoints } from '@/hooks/useLeaderboardData';

interface LeaderboardProps {
  participants: ParticipantWithPoints[];
}

export function Leaderboard({ participants }: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMedalEmoji = (position: number) => {
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

  const getRowStyles = (index: number) => {
    if (index === 0) return 'bg-accent/10 border-l-4 border-l-accent';
    if (index === 1) return 'bg-muted/50 border-l-4 border-l-muted-foreground/50';
    if (index === 2) return 'bg-amber-500/5 border-l-4 border-l-amber-600/50';
    return index % 2 === 0 ? 'bg-card' : 'bg-secondary/30';
  };

  return (
    <section id="ranking" className="py-12 px-4">
      <div className="container">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Classificação Completa</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Ranking Geral
          </h2>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            {participants.length} participantes
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border focus:border-accent focus:ring-accent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="max-w-2xl mx-auto card-royal overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-primary text-primary-foreground font-medium text-sm">
            <div className="col-span-2 text-center">#</div>
            <div className="col-span-7">Nome</div>
            <div className="col-span-3 text-right">Pontos</div>
          </div>

          {/* Body */}
          <div className="divide-y divide-border">
            {filteredParticipants.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                Nenhum participante encontrado
              </div>
            ) : (
              filteredParticipants.map((participant, index) => {
                const originalIndex = participants.findIndex(p => p.id === participant.id);
                return (
                  <div
                    key={participant.id}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors hover:bg-accent/5 ${getRowStyles(originalIndex)}`}
                  >
                    <div className="col-span-2 text-center">
                      {getMedalEmoji(originalIndex) ? (
                        <span className="text-xl">{getMedalEmoji(originalIndex)}</span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                          {originalIndex + 1}
                        </span>
                      )}
                    </div>
                    <div className="col-span-7 font-medium text-foreground truncate">
                      {participant.name}
                    </div>
                    <div className="col-span-3 text-right flex items-center justify-end gap-2">
                      <PointsDelta delta={participant.pointsDelta} size="sm" />
                      <div className="flex items-center gap-1">
                        <Medal className={`w-4 h-4 ${originalIndex < 3 ? 'text-accent' : 'text-muted-foreground'}`} />
                        <span className={`font-bold ${originalIndex < 3 ? 'text-accent' : 'text-foreground'}`}>
                          {participant.points}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
