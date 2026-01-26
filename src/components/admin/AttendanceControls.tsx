import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AttendanceControlsProps {
  date: Date;
  onDateChange: (date: Date) => void;
  attendanceType: string;
  onTypeChange: (type: string) => void;
}

const ATTENDANCE_TYPES = [
  { value: 'embaixada', label: 'Embaixada' },
  { value: 'igreja', label: 'Igreja' },
  { value: 'pg', label: 'PG' },
];

export function AttendanceControls({
  date,
  onDateChange,
  attendanceType,
  onTypeChange
}: AttendanceControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium whitespace-nowrap">Data:</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : <span>Selecione</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && onDateChange(d)}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-4">
        <Label className="text-sm font-medium whitespace-nowrap">Tipo:</Label>
        <RadioGroup
          value={attendanceType}
          onValueChange={onTypeChange}
          className="flex gap-4"
        >
          {ATTENDANCE_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <RadioGroupItem value={type.value} id={type.value} />
              <Label htmlFor={type.value} className="font-normal cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
