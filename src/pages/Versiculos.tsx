import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { useVersesData } from '@/hooks/useVersesData';
import { Loader2, AlertCircle, BookOpen, Search, ExternalLink, Eye, List, Shield, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Versiculos = () => {
  const { data: leaderboardData, loading: loadingLeaderboard, error: errorLeaderboard } = useLeaderboardData();
  const { data: versesData, isLoading: loadingVerses, error: errorVerses } = useVersesData();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'compact' | 'expanded' | 'allVerses'>('compact');
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  const loading = loadingLeaderboard || loadingVerses;
  const error = errorLeaderboard || (errorVerses ? 'Erro ao carregar versículos' : null);

  // Initialize selected version from localStorage or default
  useEffect(() => {
    if (versesData) {
      const savedVersion = localStorage.getItem('bibleVersion');
      const defaultVersion = versesData.defaultVersion;
      const availableVersions = Object.keys(versesData.versions);

      if (savedVersion && availableVersions.includes(savedVersion)) {
        setSelectedVersion(savedVersion);
      } else if (availableVersions.includes(defaultVersion)) {
        setSelectedVersion(defaultVersion);
      } else if (availableVersions.length > 0) {
        setSelectedVersion(availableVersions[0]);
      }
    }
  }, [versesData]);

  // Save selected version to localStorage
  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    localStorage.setItem('bibleVersion', version);
  };

  // Filter participants who have memorized verses
  const participantsWithVerses = leaderboardData?.participants
    .filter(p => p.memorizedVerses && p.memorizedVerses.length > 0)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aCount = a.memorizedVerses?.length || 0;
      const bCount = b.memorizedVerses?.length || 0;
      if (bCount !== aCount) return bCount - aCount;
      return a.name.localeCompare(b.name);
    }) || [];

  // Get all unique verses for "all verses" view
  const allUniqueVerses = Array.from(
    new Set(
      leaderboardData?.participants
        .flatMap(p => p.memorizedVerses || [])
    )
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Carregando versículos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="card-royal p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Erro ao carregar</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const availableVersions = Object.keys(versesData?.versions || {});

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
                <span className="text-sm font-medium text-accent">Tesouro do Coração</span>
                <Crown className="w-4 h-4 text-accent" />
              </div>

              <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary-foreground mb-4">
                Versículos Memorizados
              </h1>

              <p className="text-lg text-primary-foreground/90 mb-4 flex items-center justify-center gap-3">
                <Shield className="w-5 h-5 text-accent" />
                <span>Proteção para hoje, preparação para a eternidade</span>
                <Crown className="w-5 h-5 text-accent" />
              </p>

              <div className="max-w-2xl mx-auto space-y-2 text-sm text-primary-foreground/80 italic mb-4">
                <p className="flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>"O Senhor te guardará de todo mal; guardará a tua alma." - Sl 121:7-8</span>
                </p>
                <p className="flex items-center justify-center gap-1">
                  <Crown className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>"E a vida eterna é esta: que te conheçam a ti..." - Jo 17:3</span>
                </p>
              </div>

              <p className="text-sm text-primary-foreground/60">
                {selectedVersion && versesData?.versions[selectedVersion]?.name || 'NVI'} • Atualizado em {versesData?.generatedAt ? new Date(versesData.generatedAt).toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
          </div>
        </section>

        {/* Controls Section */}
        <section className="py-8 border-b bg-muted/30">
          <div className="container px-4">
            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
              {/* Row 1: Search and View Mode */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'compact' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('compact')}
                    className={viewMode === 'compact' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <List className="w-4 h-4 mr-2" />
                    Compacto
                  </Button>
                  <Button
                    variant={viewMode === 'expanded' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('expanded')}
                    className={viewMode === 'expanded' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Expandido
                  </Button>
                  <Button
                    variant={viewMode === 'allVerses' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('allVerses')}
                    className={viewMode === 'allVerses' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Todos Versículos
                  </Button>
                </div>
              </div>

              {/* Row 2: Version Toggle */}
              {availableVersions.length > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground mr-2">Versão:</span>
                  {availableVersions.map((version) => (
                    <Button
                      key={version}
                      variant={selectedVersion === version ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleVersionChange(version)}
                      className={selectedVersion === version ? 'bg-accent text-accent-foreground' : 'border-accent/40 text-accent hover:bg-accent/10'}
                    >
                      {version}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Participants Section */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              {viewMode === 'allVerses' ? (
                /* All Verses View - Show all unique verses expanded */
                allUniqueVerses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Nenhum versículo decorado ainda
                    </h3>
                    <p className="text-muted-foreground">
                      Os versículos decorados aparecerão aqui
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allUniqueVerses.map((ref, idx) => {
                      const verseData = versesData?.verses[ref]?.[selectedVersion];
                      return (
                        <div
                          key={idx}
                          className="card-royal p-6 animate-fade-in"
                        >
                          <h3 className="text-lg font-semibold text-accent mb-3">
                            {verseData?.reference || ref}
                          </h3>
                          {verseData ? (
                            <div className="space-y-3">
                              <p className="text-foreground leading-relaxed italic text-base">
                                "{verseData.text}"
                              </p>
                              <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-sm text-muted-foreground">
                                  {verseData.wordCount} palavras
                                </span>
                                <a
                                  href={verseData.youversionUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                                >
                                  Ver no YouVersion
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              Texto do versículo não disponível nesta versão
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* By Participant View - Compact or Expanded */
                participantsWithVerses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum versículo decorado ainda'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Tente outro termo de busca' : 'Os versículos decorados aparecerão aqui'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participantsWithVerses.map((participant) => (
                      <div
                        key={participant.id}
                        className="card-royal p-6 animate-fade-in"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-primary">
                            {participant.name}
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            {participant.memorizedVerses?.length || 0} versículo(s)
                          </span>
                        </div>

                        {viewMode === 'compact' ? (
                          <div className="flex flex-wrap gap-2">
                            {participant.memorizedVerses?.map((ref, idx) => {
                              const verseData = versesData?.verses[ref]?.[selectedVersion];
                              return (
                                <a
                                  key={idx}
                                  href={verseData?.youversionUrl || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
                                >
                                  {ref}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              );
                            })}
                          </div>
                        ) : (
                          <Accordion type="multiple" className="space-y-2">
                            {participant.memorizedVerses?.map((ref, idx) => {
                              const verseData = versesData?.verses[ref]?.[selectedVersion];
                              return (
                                <AccordionItem key={idx} value={`verse-${idx}`} className="border border-border rounded-lg overflow-hidden">
                                  <AccordionTrigger className="px-4 hover:bg-muted/50">
                                    <span className="font-medium text-accent">{verseData?.reference || ref}</span>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4 bg-muted/20">
                                    {verseData ? (
                                      <div className="space-y-3">
                                        <p className="text-foreground leading-relaxed italic">
                                          "{verseData.text}"
                                        </p>
                                        <a
                                          href={verseData.youversionUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                                        >
                                          Ver no YouVersion
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground text-sm">
                                        Texto do versículo não disponível nesta versão
                                      </p>
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            })}
                          </Accordion>
                        )}
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

export default Versiculos;
