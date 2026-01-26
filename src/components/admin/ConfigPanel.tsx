import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ConfigPanelProps {
  pointsAsOf?: string;
  onUpdatePointsAsOf: (date: string) => Promise<void>;
}

export function ConfigPanel({ pointsAsOf, onUpdatePointsAsOf }: ConfigPanelProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    pointsAsOf ? new Date(pointsAsOf) : undefined
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!selectedDate) return;

    setSaving(true);
    setSaved(false);
    try {
      // Set to start of day in UTC
      const isoDate = new Date(
        Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      ).toISOString();
      await onUpdatePointsAsOf(isoDate);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = (() => {
    if (!selectedDate && !pointsAsOf) return false;
    if (!selectedDate || !pointsAsOf) return true;
    const current = new Date(pointsAsOf);
    return (
      selectedDate.getFullYear() !== current.getFullYear() ||
      selectedDate.getMonth() !== current.getMonth() ||
      selectedDate.getDate() !== current.getDate()
    );
  })();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Configuracoes de Delta</h3>
        <p className="text-sm text-muted-foreground mb-4">
          O delta de pontos mostra os pontos ganhos desde a data configurada abaixo.
          Apenas atividades com timestamp (addedAt) apos essa data serao contadas no delta.
        </p>
      </div>

      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label>Data de Comparacao (pointsAsOf)</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[200px] justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saved ? 'Salvo!' : 'Salvar'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {pointsAsOf ? (
              <>Atual: {format(new Date(pointsAsOf), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}</>
            ) : (
              'Nenhuma data configurada'
            )}
          </p>
        </div>
      </div>

      <div className="border-t pt-4 mt-6">
        <h4 className="font-medium mb-2">Como funciona</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Atividades adicionadas pelo admin recebem timestamp automatico</li>
          <li>O delta conta apenas atividades com timestamp &gt;= pointsAsOf</li>
          <li>Atividades sem timestamp (dados antigos) nao aparecem no delta</li>
          <li>Altere a data para mostrar "pontos ganhos esta semana/mes"</li>
        </ul>
      </div>
    </div>
  );
}
