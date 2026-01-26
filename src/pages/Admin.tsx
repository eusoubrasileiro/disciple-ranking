import { useState, useEffect, useCallback } from 'react';
import { Loader2, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs } from '@/components/ui/tabs';
import { useAdminApi } from '@/hooks/useAdminApi';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { AttendanceControls } from '@/components/admin/AttendanceControls';
import { ParticipantGrid } from '@/components/admin/ParticipantGrid';
import { ActivityHistory } from '@/components/admin/ActivityHistory';
import { ConfigPanel } from '@/components/admin/ConfigPanel';
import type { Participant, Rule, VersesData, LeaderboardData } from '@/hooks/useLeaderboardData';

export default function Admin() {
  const api = useAdminApi();

  const [activeTab, setActiveTab] = useState('attendance');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [versesData, setVersesData] = useState<VersesData | undefined>();
  const [loading, setLoading] = useState(true);

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState<Date>(new Date());
  const [attendanceType, setAttendanceType] = useState('embaixada');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch from API (local server)
      const result = await api.fetchLeaderboard();
      if (result.error) {
        throw new Error(result.error);
      }
      setData(result.data || null);

      // Also fetch rules and verses from static files
      const [rulesRes, versesRes] = await Promise.all([
        fetch(`${import.meta.env.BASE_URL}data/rules.json`),
        fetch(`${import.meta.env.BASE_URL}data/verses.json`)
      ]);

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData.rules || []);
      }

      if (versesRes.ok) {
        setVersesData(await versesRes.json());
      }
    } catch (err) {
      toast.error('Erro ao carregar dados', {
        description: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddBulkAttendance = async () => {
    if (selectedIds.size === 0) {
      toast.error('Nenhum participante selecionado', {
        description: 'Selecione pelo menos um participante'
      });
      return;
    }

    setSubmittingAttendance(true);
    try {
      // Format date using local values to avoid timezone issues
      const year = attendanceDate.getFullYear();
      const month = String(attendanceDate.getMonth() + 1).padStart(2, '0');
      const day = String(attendanceDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const result = await api.addBulkAttendance(
        Array.from(selectedIds),
        dateStr,
        attendanceType
      );

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Presenca adicionada', {
        description: `${result.data?.updatedIds.length || 0} participantes atualizados`
      });

      // Clear selection and refresh data
      setSelectedIds(new Set());
      await fetchData();
    } catch (err) {
      toast.error('Erro ao adicionar presenca', {
        description: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const handleAddVerse = async (participantId: number, ref: string) => {
    const result = await api.addVerse(participantId, ref);
    if (result.error) {
      toast.error('Erro ao adicionar versiculo', { description: result.error });
      return;
    }
    toast.success('Versiculo adicionado', { description: `${ref} adicionado com sucesso` });
    await fetchData();
  };

  const handleAddVisitor = async (participantId: number, name: string) => {
    const result = await api.addVisitor(participantId, name);
    if (result.error) {
      toast.error('Erro ao adicionar visitante', { description: result.error });
      return;
    }
    toast.success('Visitante adicionado', { description: `${name} adicionado com sucesso` });
    await fetchData();
  };

  const handleFetchHistory = async () => {
    const result = await api.fetchActivityHistory();
    if (result.error) {
      toast.error('Erro ao carregar historico', { description: result.error });
      return undefined;
    }
    return result.data;
  };

  const handleDeleteActivity = async (
    type: 'attendance' | 'verse' | 'visitor',
    participantId: number,
    index: number
  ) => {
    let result;
    switch (type) {
      case 'attendance':
        result = await api.removeAttendance(participantId, index);
        break;
      case 'verse':
        result = await api.removeVerse(participantId, index);
        break;
      case 'visitor':
        result = await api.removeVisitor(participantId, index);
        break;
    }

    if (result?.error) {
      toast.error('Erro ao excluir', { description: result.error });
      return;
    }

    toast.success('Atividade excluida', { description: 'A atividade foi removida com sucesso' });
    await fetchData();
  };

  const handleUpdatePointsAsOf = async (date: string) => {
    const result = await api.updatePointsAsOf(date);
    if (result.error) {
      toast.error('Erro ao atualizar configuracao', { description: result.error });
      return;
    }
    toast.success('Configuracao salva', { description: 'Data de comparacao atualizada' });
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Admin - Embaixadores do Rei</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <AdminTabs value={activeTab} onValueChange={setActiveTab} />

          <div className="mt-6">
            <TabsContent value="attendance" className="mt-0 space-y-4">
              <AttendanceControls
                date={attendanceDate}
                onDateChange={setAttendanceDate}
                attendanceType={attendanceType}
                onTypeChange={setAttendanceType}
              />

              <ParticipantGrid
                participants={data?.participants || []}
                rules={rules}
                versesData={versesData}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onAddVerse={handleAddVerse}
                onAddVisitor={handleAddVisitor}
                loading={submittingAttendance}
              />

              <div className="flex justify-end">
                <Button
                  onClick={handleAddBulkAttendance}
                  disabled={selectedIds.size === 0 || submittingAttendance}
                  size="lg"
                >
                  {submittingAttendance ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Adicionar Presenca aos Marcados ({selectedIds.size})
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="verses" className="mt-0">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Use a aba "Presenca" para adicionar versiculos a participantes individuais clicando no botao "Vers".
                </p>
                <ParticipantGrid
                  participants={data?.participants || []}
                  rules={rules}
                  versesData={versesData}
                  selectedIds={new Set()}
                  onSelectionChange={() => {}}
                  onAddVerse={handleAddVerse}
                  onAddVisitor={handleAddVisitor}
                />
              </div>
            </TabsContent>

            <TabsContent value="visitors" className="mt-0">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Use a aba "Presenca" para adicionar visitantes a participantes individuais clicando no botao "Visit".
                </p>
                <ParticipantGrid
                  participants={data?.participants || []}
                  rules={rules}
                  versesData={versesData}
                  selectedIds={new Set()}
                  onSelectionChange={() => {}}
                  onAddVerse={handleAddVerse}
                  onAddVisitor={handleAddVisitor}
                />
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <ActivityHistory
                onFetch={handleFetchHistory}
                onDelete={handleDeleteActivity}
              />
            </TabsContent>

            <TabsContent value="config" className="mt-0">
              <ConfigPanel
                pointsAsOf={data?.pointsAsOf}
                onUpdatePointsAsOf={handleUpdatePointsAsOf}
              />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
