import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, BookOpen, UserPlus, Loader2 } from 'lucide-react';
import { parseLocalDate } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { getAttendanceAbbrev } from '@/lib/activityConfig';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { calculateParticipantPoints } from '@/lib/calculatePoints';
import type { Participant, Rule, VersesData } from '@/hooks/useLeaderboardData';

interface ParticipantGridProps {
  participants: Participant[];
  rules: Rule[];
  versesData?: VersesData;
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
  onAddVerse: (participantId: number, ref: string) => Promise<void>;
  onAddVisitor: (participantId: number, name: string) => Promise<void>;
  loading?: boolean;
}

export function ParticipantGrid({
  participants,
  rules,
  versesData,
  selectedIds,
  onSelectionChange,
  onAddVerse,
  onAddVisitor,
  loading
}: ParticipantGridProps) {
  const [inlineInput, setInlineInput] = useState<{
    participantId: number;
    type: 'verse' | 'visitor';
    value: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  };

  const selectAll = () => {
    onSelectionChange(new Set(participants.map(p => p.id)));
  };

  const clearSelection = () => {
    onSelectionChange(new Set());
  };

  const getLastAttendance = (participant: Participant): string => {
    if (!participant.attendance || participant.attendance.length === 0) {
      return '-';
    }
    const sorted = [...participant.attendance].sort(
      (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
    );
    const last = sorted[0];
    const date = parseLocalDate(last.date);
    return `${format(date, 'dd/MM', { locale: ptBR })} ${getAttendanceAbbrev(last.type)}`;
  };

  const handleInlineSubmit = async () => {
    if (!inlineInput || !inlineInput.value.trim()) return;

    setSubmitting(true);
    try {
      if (inlineInput.type === 'verse') {
        // Support comma-separated verse references
        const refs = inlineInput.value
          .split(',')
          .map(ref => ref.trim())
          .filter(ref => ref.length > 0);

        for (const ref of refs) {
          await onAddVerse(inlineInput.participantId, ref);
        }
      } else {
        await onAddVisitor(inlineInput.participantId, inlineInput.value.trim());
      }
      setInlineInput(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInlineCancel = () => {
    setInlineInput(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInlineSubmit();
    } else if (e.key === 'Escape') {
      handleInlineCancel();
    }
  };

  // Sort participants alphabetically
  const sortedParticipants = [...participants].sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR')
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={selectAll}>
          Selecionar Todos
        </Button>
        <Button variant="outline" size="sm" onClick={clearSelection}>
          Limpar
        </Button>
        <span className="text-sm text-muted-foreground self-center ml-2">
          {selectedIds.size} selecionados
        </span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Participante</TableHead>
              <TableHead className="w-20 text-right">Pontos</TableHead>
              <TableHead className="w-48">Acoes</TableHead>
              <TableHead className="w-32">Ultima</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedParticipants.map((participant) => {
              const points = calculateParticipantPoints(
                participant,
                rules,
                versesData,
                versesData?.defaultVersion ?? 'NVI'
              );
              const isSelected = selectedIds.has(participant.id);
              const showInline = inlineInput?.participantId === participant.id;

              return (
                <TableRow key={participant.id} className={isSelected ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(participant.id)}
                      disabled={loading}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{participant.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{points}</TableCell>
                  <TableCell>
                    {showInline ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={inlineInput.value}
                          onChange={(e) => setInlineInput({ ...inlineInput, value: e.target.value })}
                          onKeyDown={handleKeyDown}
                          placeholder={inlineInput.type === 'verse' ? 'Ex: Jo 3:16, Sl 23:1' : 'Nome'}
                          className="h-8 w-28"
                          autoFocus
                          disabled={submitting}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={handleInlineSubmit}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={handleInlineCancel}
                          disabled={submitting}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => setInlineInput({
                            participantId: participant.id,
                            type: 'verse',
                            value: ''
                          })}
                          disabled={loading}
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          Vers
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => setInlineInput({
                            participantId: participant.id,
                            type: 'visitor',
                            value: ''
                          })}
                          disabled={loading}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getLastAttendance(participant)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
