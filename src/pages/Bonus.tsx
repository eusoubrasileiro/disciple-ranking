import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { useBonusData, BonusChallenge, BonusResult } from '@/hooks/useBonusData';
import { Star, Search, Calendar, Users, Crown, Shield, Dumbbell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDateShort } from '@/lib/dateUtils';
import { getParticipantName } from '@/lib/participantUtils';

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  Star,
  Dumbbell,
};

const Bonus = () => {
  const { data: leaderboardData, loading: leaderboardLoading, error: leaderboardError } = useLeaderboardData();
  const { data: bonusData, isLoading: bonusLoading, error: bonusError } = useBonusData();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'byEvent' | 'byParticipant'>('byEvent');

  const loading = leaderboardLoading || bonusLoading;
  const error = leaderboardError || (bonusError ? bonusError.message : null);
  const participants = leaderboardData?.participants;

  // Sort challenges by date (most recent first)
  const sortedChallenges = [...(bonusData?.challenges || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter challenges by participant name or challenge name in search
  const filteredChallenges = sortedChallenges.filter(challenge => {
    if (!searchQuery) return true;
    const participantNames = challenge.results.map(r => getParticipantName(participants,r.participantId).toLowerCase());
    return participantNames.some(name => name.includes(searchQuery.toLowerCase())) ||
           challenge.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate participant bonus summaries for "by participant" view
  const participantSummaries = (() => {
    const summaryMap = new Map<number, {
      participantId: number;
      totalPoints: number;
      challengesCompleted: number;
      challengeHistory: { challenge: BonusChallenge; result: BonusResult }[];
    }>();

    bonusData?.challenges.forEach(challenge => {
      challenge.results.forEach(result => {
        const existing = summaryMap.get(result.participantId) || {
          participantId: result.participantId,
          totalPoints: 0,
          challengesCompleted: 0,
          challengeHistory: [],
        };
        existing.totalPoints += result.points;
        existing.challengesCompleted += 1;
        existing.challengeHistory.push({ challenge, result });
        summaryMap.set(result.participantId, existing);
      });
    });

    return Array.from(summaryMap.values())
      .filter(summary => {
        if (!searchQuery) return true;
        const name = getParticipantName(participants,summary.participantId).toLowerCase();
        return name.includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);
  })();

  // Calculate totals
  const totalChallenges = bonusData?.challenges.length || 0;
  const totalPointsDistributed = bonusData?.challenges.reduce(
    (acc, challenge) => acc + challenge.results.reduce((sum, r) => sum + r.points, 0),
    0
  ) || 0;

  if (loading) {
    return <LoadingState message="Carregando bonus..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden royal-gradient py-16 sm:py-20">
          <div className="container px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/40 mb-6">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Desafios</span>
                <Crown className="w-4 h-4 text-accent" />
              </div>

              <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary-foreground mb-4">
                Pontos Bonus
              </h1>

              <p className="text-lg text-primary-foreground/90 mb-4 flex items-center justify-center gap-3">
                <Star className="w-5 h-5 text-accent fill-accent" />
                <span>Desafios fisicos e conquistas especiais</span>
              </p>

              <div className="flex items-center justify-center gap-6 text-sm text-primary-foreground/60">
                <span>{totalChallenges} desafio{totalChallenges !== 1 ? 's' : ''} realizado{totalChallenges !== 1 ? 's' : ''}</span>
                <span>|</span>
                <span>{totalPointsDistributed} pontos distribuidos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Controls Section */}
        <section className="py-8 border-b bg-muted/30">
          <div className="container px-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between max-w-4xl mx-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* View Mode Toggle */}
              <ViewModeToggle
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: 'byEvent', label: 'Por Desafio', icon: Calendar },
                  { value: 'byParticipant', label: 'Por Participante', icon: Users },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Challenges Section */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              {viewMode === 'byEvent' ? (
                /* By Event View */
                filteredChallenges.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum desafio ainda'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Tente outro termo de busca' : 'Os desafios realizados aparecerao aqui'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredChallenges.map((challenge) => {
                      const ChallengeIcon = challenge.icon && iconMap[challenge.icon] ? iconMap[challenge.icon] : Star;
                      return (
                      <div
                        key={challenge.id}
                        className="card-royal p-6 animate-fade-in"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
                              <ChallengeIcon className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-primary">
                                {challenge.name}
                              </h3>
                              {challenge.description && (
                                <p className="text-sm text-muted-foreground">{challenge.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDateShort(challenge.date)}
                          </div>
                        </div>

                        {/* Results */}
                        <div className="space-y-2">
                          {challenge.results
                            .sort((a, b) => b.points - a.points)
                            .map((result) => (
                              <div
                                key={`${challenge.id}-${result.participantId}`}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                              >
                                <div className="flex items-center gap-3">
                                  <ChallengeIcon className="w-4 h-4 text-accent" />
                                  <span className="font-medium">{getParticipantName(participants,result.participantId)}</span>
                                </div>
                                <span className="text-sm text-accent font-semibold">+{result.points} pts</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )})}
                  </div>
                )
              ) : (
                /* By Participant View */
                participantSummaries.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum participante ainda'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Tente outro termo de busca' : 'Os participantes dos desafios aparecerao aqui'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participantSummaries.map((summary) => (
                      <div
                        key={summary.participantId}
                        className="card-royal p-6 animate-fade-in"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-primary">
                            {getParticipantName(participants,summary.participantId)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                              {summary.challengesCompleted} desafio{summary.challengesCompleted !== 1 ? 's' : ''}
                            </span>
                            <span className="text-muted-foreground">|</span>
                            <span className="font-semibold text-accent">
                              +{summary.totalPoints} pts
                            </span>
                          </div>
                        </div>

                        {/* Challenge History */}
                        <div className="space-y-2">
                          {summary.challengeHistory
                            .sort((a, b) => new Date(b.challenge.date).getTime() - new Date(a.challenge.date).getTime())
                            .map(({ challenge, result }) => {
                              const HistoryIcon = challenge.icon && iconMap[challenge.icon] ? iconMap[challenge.icon] : Star;
                              return (
                              <div
                                key={`${challenge.id}-${result.participantId}`}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                              >
                                <div className="flex items-center gap-3">
                                  <HistoryIcon className="w-4 h-4 text-accent" />
                                  <div>
                                    <span className="font-medium">{challenge.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {formatDateShort(challenge.date)}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-sm text-accent font-semibold">+{result.points} pts</span>
                              </div>
                            )})}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Bonus;
