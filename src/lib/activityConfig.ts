import { Calendar, BookOpen, UserPlus, LucideIcon } from 'lucide-react';

/**
 * Centralized activity type configuration.
 * Used across ActivityHistory and ParticipantGrid components.
 */

export type ActivityType = 'attendance' | 'verse' | 'visitor';

interface ActivityTypeConfig {
  icon: LucideIcon;
  label: string;
}

export const ACTIVITY_TYPES: Record<ActivityType, ActivityTypeConfig> = {
  attendance: { icon: Calendar, label: 'Presenca' },
  verse: { icon: BookOpen, label: 'Versiculo' },
  visitor: { icon: UserPlus, label: 'Visitante' },
};

export type AttendanceType = 'embaixada' | 'igreja' | 'pg';

interface AttendanceTypeConfig {
  label: string;
  abbrev: string;
}

export const ATTENDANCE_TYPES: Record<AttendanceType, AttendanceTypeConfig> = {
  embaixada: { label: 'Embaixada', abbrev: 'Emb' },
  igreja: { label: 'Igreja', abbrev: 'Igr' },
  pg: { label: 'PG', abbrev: 'PG' },
};

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
 * Get label for attendance type
 */
export function getAttendanceLabel(type: string): string {
  return ATTENDANCE_TYPES[type as AttendanceType]?.label ?? type;
}

/**
 * Get abbreviated label for attendance type
 */
export function getAttendanceAbbrev(type: string): string {
  return ATTENDANCE_TYPES[type as AttendanceType]?.abbrev ?? type;
}
