import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useLeaderboardData } from '@/hooks/useLeaderboardData';
import { useAppConfig } from '@/ConfigProvider';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceDayDetails } from '@/components/attendance/AttendanceDayDetails';
import {
  CalendarDays,
  Users,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ptBR } from 'date-fns/locale';
import { parseISO, isSameDay } from 'date-fns';
import {
  getAllAttendanceDates,
  getAttendanceDatesByType,
  getActivityTypeInfo,
  getTotalAttendanceCount,
  getTotalAttendancePoints,
  ATTENDANCE_POINTS
} from '@/lib/attendanceUtils';
import type { Participant } from '@/hooks/useLeaderboardData';

const Presenca = () => {
  const config = useAppConfig();
  const { data, loading, error, sortedParticipants } = useLeaderboardData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const terminology = config?.terminology ?? {
    participant: 'Participante',
    participants: 'Participantes',
    attendance: 'Presenca'
  };

  // Get the selected participant if any
  const selectedParticipant = selectedParticipantId
    ? sortedParticipants.find(p => p.id === selectedParticipantId)
    : null;

  // Calculate attendance statistics
  const stats = useMemo(() => {
    if (!data?.participants) return { total: 0, byType: {} as Record<string, number> };

    let total = 0;
    const byType: Record<string, number> = {};

    const participantsToCount = selectedParticipant
      ? [selectedParticipant]
      : data.participants;

    participantsToCount.forEach(p => {
      p.attendance?.forEach(record => {
        total++;
        byType[record.type] = (byType[record.type] || 0) + 1;
      });
    });

    return { total, byType };
  }, [data?.participants, selectedParticipant]);

  // Get all attendance dates for highlighting
  const attendanceDatesByType = useMemo(() => {
    if (!data?.participants) return {};

    const participantsToHighlight = selectedParticipant
      ? [selectedParticipant]
      : data.participants;

    return getAttendanceDatesByType(participantsToHighlight);
  }, [data?.participants, selectedParticipant]);

  // Create modifiers for calendar styling
  const calendarModifiers = useMemo(() => {
    const modifiers: Record<string, Date[]> = {};

    Object.entries(attendanceDatesByType).forEach(([type, dates]) => {
      modifiers[type] = dates;
    });

    return modifiers;
  }, [attendanceDatesByType]);

  // Create modifier styles
  const calendarModifiersStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    Object.keys(attendanceDatesByType).forEach(type => {
      const typeInfo = getActivityTypeInfo(type);
      // Use box-shadow to show markers below the date number
      styles[type] = {
        position: 'relative',
      };
    });

    return styles;
  }, [attendanceDatesByType]);

  // Custom day content to show activity markers
  const DayContent = ({ date }: { date: Date }) => {
    const dayNumber = date.getDate();
    const markers: { type: string; colorClass: string }[] = [];

    Object.entries(attendanceDatesByType).forEach(([type, dates]) => {
      if (dates.some(d => isSameDay(d, date))) {
        const typeInfo = getActivityTypeInfo(type);
        markers.push({ type, colorClass: typeInfo.bgClass });
      }
    });

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <span>{dayNumber}</span>
        {markers.length > 0 && (
          <div className="absolute bottom-0.5 flex gap-0.5">
            {markers.map(marker => (
              <div
                key={marker.type}
                className={`w-1.5 h-1.5 rounded-full ${marker.colorClass}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingState message="Carregando presencas..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'Nao foi possivel carregar os dados.'} />;
  }

  // Sort participants by name for filter dropdown
  const participantsSorted = [...sortedParticipants].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden royal-gradient py-12 sm:py-16">
          <div className="container px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/40 mb-6">
                <CalendarDays className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">
                  Calendario de {terminology.attendance}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary-foreground mb-4">
                {terminology.attendance}
              </h1>

              {/* Stats Summary */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10">
                  <Users className="w-4 h-4 text-accent" />
                  <span className="text-sm text-primary-foreground">
                    {selectedParticipant
                      ? selectedParticipant.name
                      : `${data.participants.length} ${terminology.participants}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10">
                  <CalendarDays className="w-4 h-4 text-accent" />
                  <span className="text-sm text-primary-foreground">
                    {stats.total} presenca{stats.total !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20">
                  <span className="text-sm font-semibold text-accent">
                    +{stats.total * ATTENDANCE_POINTS} pontos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-4 border-b bg-muted/30">
          <div className="container px-4">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">Filtrar por:</span>

              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-w-[200px] justify-between"
                  >
                    <span>
                      {selectedParticipant
                        ? selectedParticipant.name
                        : `Todos ${terminology.participants}`}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <div className="max-h-[300px] overflow-auto">
                    <button
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors ${
                        !selectedParticipantId ? 'bg-accent/20 text-accent font-medium' : ''
                      }`}
                      onClick={() => {
                        setSelectedParticipantId(null);
                        setFilterOpen(false);
                      }}
                    >
                      Todos {terminology.participants}
                    </button>
                    {participantsSorted.map(participant => (
                      <button
                        key={participant.id}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors ${
                          selectedParticipantId === participant.id
                            ? 'bg-accent/20 text-accent font-medium'
                            : ''
                        }`}
                        onClick={() => {
                          setSelectedParticipantId(participant.id);
                          setFilterOpen(false);
                        }}
                      >
                        {participant.name}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </section>

        {/* Calendar + Details Section */}
        <section className="py-8">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar Card */}
                <div className="card-royal p-4 sm:p-6">
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={ptBR}
                      modifiers={calendarModifiers}
                      modifiersStyles={calendarModifiersStyles}
                      components={{
                        DayContent: DayContent,
                      }}
                      className="rounded-md"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4 w-full",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-base font-semibold",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-10 sm:w-12 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "h-10 w-10 sm:h-12 sm:w-12 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                        day: "h-10 w-10 sm:h-12 sm:w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md transition-colors",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                        day_today: "bg-accent/30 text-accent-foreground font-semibold",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t">
                    {Object.keys(attendanceDatesByType).map(type => {
                      const typeInfo = getActivityTypeInfo(type);
                      return (
                        <div key={type} className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${typeInfo.bgClass}`} />
                          <span className="text-sm text-muted-foreground">
                            {typeInfo.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Details Panel */}
                <div className="card-royal min-h-[400px] lg:min-h-0">
                  <AttendanceDayDetails
                    selectedDate={selectedDate}
                    participants={data.participants}
                    selectedParticipantId={selectedParticipantId}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Presenca;
