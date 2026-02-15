import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Loader2, RefreshCw, Info } from 'lucide-react';
import { parseLocalDate } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getActivityIcon, getActivityLabel, getAttendanceLabel, type ActivityType } from '@/lib/activityConfig';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ActivityItem {
  type: 'attendance' | 'verse' | 'visitor' | 'discipline' | 'sermonNote';
  participantId: number;
  participantName: string;
  index: number;
  data: Record<string, unknown>;
  addedAt: string;
}

interface ActivityHistoryProps {
  onFetch: () => Promise<{ activities: ActivityItem[] } | undefined>;
  onDelete: (type: 'attendance' | 'verse' | 'visitor' | 'discipline' | 'sermonNote', participantId: number, index: number) => Promise<void>;
}

export function ActivityHistory({ onFetch, onDelete }: ActivityHistoryProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const result = await onFetch();
      if (result) {
        setActivities(result.activities);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDelete = async (activity: ActivityItem) => {
    const key = `${activity.type}-${activity.participantId}-${activity.index}`;
    setDeleting(key);
    try {
      await onDelete(activity.type, activity.participantId, activity.index);
      // Refetch after deletion
      await fetchActivities();
    } finally {
      setDeleting(null);
    }
  };

  const renderTypeIcon = (type: ActivityType) => {
    const Icon = getActivityIcon(type);
    return <Icon className="h-4 w-4" />;
  };

  const getActivityDescription = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'attendance': {
        const data = activity.data as { date?: string; type?: string };
        return `${getAttendanceLabel(data.type || '')} - ${data.date ? format(parseLocalDate(data.date), 'dd/MM/yyyy', { locale: ptBR }) : ''}`;
      }
      case 'verse': {
        const data = activity.data as { ref?: string };
        return data.ref || '';
      }
      case 'visitor': {
        const data = activity.data as { name?: string };
        return data.name || '';
      }
      case 'discipline': {
        const data = activity.data as { reason?: string; points?: number };
        const reason = data.reason || 'Sem motivo';
        return `${reason} (${data.points}pts)`;
      }
      case 'sermonNote': {
        const data = activity.data as { description?: string; points?: number };
        const desc = data.description || 'Sem descricao';
        return `${desc} (${data.points}pts)`;
      }
      default:
        return JSON.stringify(activity.data);
    }
  };

  const formatAddedAt = (addedAt: string) => {
    try {
      const date = new Date(addedAt);
      if (date.getFullYear() < 2000) return '-';
      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Atividades Recentes</h3>
        <Button variant="outline" size="sm" onClick={fetchActivities}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Mostra as 50 atividades mais recentes de todos os participantes.
          Registros antigos sem data de adicao aparecem com "-".
        </p>
      </div>

      {activities.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhuma atividade encontrada
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Tipo</TableHead>
                <TableHead>Participante</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead className="w-36">Adicionado em</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity, idx) => {
                const key = `${activity.type}-${activity.participantId}-${activity.index}`;
                const isDeleting = deleting === key;

                return (
                  <TableRow key={`${key}-${idx}`}>
                    <TableCell>
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        {renderTypeIcon(activity.type)}
                        {getActivityLabel(activity.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {activity.participantName}
                    </TableCell>
                    <TableCell>{getActivityDescription(activity)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatAddedAt(activity.addedAt)}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta atividade de {activity.participantName}?
                              <br />
                              <strong>{getActivityLabel(activity.type)}:</strong> {getActivityDescription(activity)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(activity)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
