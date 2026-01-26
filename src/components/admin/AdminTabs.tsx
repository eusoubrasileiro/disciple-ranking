import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, BookOpen, UserPlus, History, Settings } from 'lucide-react';

interface AdminTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function AdminTabs({ value, onValueChange }: AdminTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="attendance" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Presenca</span>
        </TabsTrigger>
        <TabsTrigger value="verses" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Versiculos</span>
        </TabsTrigger>
        <TabsTrigger value="visitors" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Visitantes</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Historico</span>
        </TabsTrigger>
        <TabsTrigger value="config" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Config</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
