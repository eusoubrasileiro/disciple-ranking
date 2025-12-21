import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { RulesSection } from '@/components/RulesSection';
import { Podium } from '@/components/Podium';
import { Leaderboard } from '@/components/Leaderboard';
import { Footer } from '@/components/Footer';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { Loader2, AlertCircle } from 'lucide-react';

const Index = () => {
  const { data, loading, error, sortedParticipants } = useLeaderboardData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="card-royal p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Erro ao carregar</h2>
          <p className="text-muted-foreground">
            {error || 'Não foi possível carregar os dados do ranking.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero 
          season={data.season} 
          updatedAt={data.updatedAt} 
          totalParticipants={data.participants.length}
        />
        <RulesSection rules={data.rules} />
        <Podium participants={sortedParticipants} />
        <Leaderboard participants={sortedParticipants} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
