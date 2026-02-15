import { Calendar, BookOpen, UserPlus, AlertTriangle, FileText, LucideIcon } from 'lucide-react';

/**
 * Centralized activity type configuration.
 * Used across ActivityHistory and ParticipantGrid components.
 */

export type ActivityType = 'attendance' | 'verse' | 'visitor' | 'discipline' | 'sermonNote';

interface ActivityTypeConfig {
  icon: LucideIcon;
  label: string;
}

export const ACTIVITY_TYPES: Record<ActivityType, ActivityTypeConfig> = {
  attendance: { icon: Calendar, label: 'Presenca' },
  verse: { icon: BookOpen, label: 'Versiculo' },
  visitor: { icon: UserPlus, label: 'Visitante' },
  discipline: { icon: AlertTriangle, label: 'Disciplina' },
  sermonNote: { icon: FileText, label: 'Anotacao' },
};

interface AttendanceTypeConfig {
  label: string;
  abbrev: string;
}

// Known attendance types with custom labels - fallback to capitalize for unknown types
const KNOWN_ATTENDANCE_TYPES: Record<string, AttendanceTypeConfig> = {
  embaixada: { label: 'Embaixada', abbrev: 'Emb' },
  igreja: { label: 'Igreja', abbrev: 'Igr' },
  pg: { label: 'PG', abbrev: 'PG' },
  // Family config types
  quarto: { label: 'Quarto', abbrev: 'Qto' },
  cozinha: { label: 'Cozinha', abbrev: 'Coz' },
  banheiro: { label: 'Banheiro', abbrev: 'Ban' },
  fora: { label: 'Fora', abbrev: 'For' },
};

// Helper to capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get icon component for activity type
 */
export function getActivityIcon(type: ActivityType): LucideIcon {
  return ACTIVITY_TYPES[type].icon;
}

/**
 * Get label for activity type
 */
export function getActivityLabel(type: ActivityType): string {
  return ACTIVITY_TYPES[type].label;
}

/**
 * Get label for attendance type (supports any dynamic type)
 */
export function getAttendanceLabel(type: string): string {
  return KNOWN_ATTENDANCE_TYPES[type]?.label ?? capitalize(type);
}

/**
 * Get abbreviated label for attendance type (supports any dynamic type)
 */
export function getAttendanceAbbrev(type: string): string {
  // For unknown types, use first 3 characters capitalized
  return KNOWN_ATTENDANCE_TYPES[type]?.abbrev ?? capitalize(type.slice(0, 3));
}
