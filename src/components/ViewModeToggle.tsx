import { LucideIcon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface ViewModeOption<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

interface ViewModeToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ViewModeOption<T>[];
  ariaLabel?: string;
}

export function ViewModeToggle<T extends string>({
  value,
  onChange,
  options,
  ariaLabel = 'View mode',
}: ViewModeToggleProps<T>) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      size="sm"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          <option.icon className="w-4 h-4 mr-2" />
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
