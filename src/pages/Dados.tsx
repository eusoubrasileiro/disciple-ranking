import { useEffect, useState } from 'react';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoadingState } from '@/components/LoadingState';
import { Database, ChevronDown, ChevronRight } from 'lucide-react';

interface DataFile {
  name: string;
  path: string;
}

const dataFiles: DataFile[] = [
  { name: 'leaderboard.json', path: 'data/leaderboard.json' },
  { name: 'rules.json', path: 'data/rules.json' },
  { name: 'games.json', path: 'data/games.json' },
  { name: 'bonus.json', path: 'data/bonus.json' },
  { name: 'verses.json', path: 'data/verses.json' },
];

const Dados = () => {
  const [fileData, setFileData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAll = async () => {
      const results: Record<string, unknown> = {};
      await Promise.all(
        dataFiles.map(async (file) => {
          try {
            const res = await fetch(`${import.meta.env.BASE_URL}${file.path}`);
            if (res.ok) {
              results[file.name] = await res.json();
            } else {
              results[file.name] = { error: `HTTP ${res.status}` };
            }
          } catch {
            results[file.name] = { error: 'Falha ao carregar arquivo' };
          }
        })
      );
      setFileData(results);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const toggleExpanded = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  if (loading) {
    return <LoadingState message="Carregando dados..." />;
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
                <Database className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Dados</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary-foreground mb-4">
                Visualizador de Dados
              </h1>

              <p className="text-lg text-primary-foreground/90">
                Confira os dados brutos para verificar se esta tudo certo
              </p>
            </div>
          </div>
        </section>

        {/* Data Files Section */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto space-y-4">
              {dataFiles.map((file) => {
                const data = fileData[file.name];
                const isExpanded = expanded[file.name] ?? false;

                return (
                  <div key={file.name} className="card-royal overflow-hidden animate-fade-in">
                    <button
                      onClick={() => toggleExpanded(file.name)}
                      className="w-full flex items-center justify-between p-3 sm:p-5 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
                          <Database className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-lg font-semibold text-primary font-mono">
                          {file.name}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 sm:px-5 sm:pb-5 border-t border-border">
                        <div className="mt-4 rounded-lg bg-muted/20 p-2 sm:p-4 overflow-x-auto text-xs sm:text-sm">
                          <JsonView
                            src={data}
                            collapsed={false}
                            enableClipboard
                            theme="default"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dados;
