import type { Rule, Participant, VersesData, AttendanceRecord } from '@/hooks/useLeaderboardData';
import type { GamesData } from '@/hooks/useGamesData';
import type { BonusData } from '@/hooks/useBonusData';

// Type for verse that can be string or object with addedAt
export type VerseRecord = string | { ref: string; addedAt?: string };

// Type for visitor that can be string or object with addedAt
export type VisitorRecord = string | { name: string; addedAt?: string };

// Extended attendance record with optional addedAt
export interface AttendanceRecordWithTimestamp extends AttendanceRecord {
  addedAt?: string;
}

/**
 * Check if an activity should be counted based on pointsAsOf date
 */
function isAfterDate(addedAt: string | undefined, pointsAsOf: string | undefined): boolean {
  if (!pointsAsOf) return true; // No cutoff, count everything
  if (!addedAt) return false;   // No timestamp, don't count for delta
  return new Date(addedAt) >= new Date(pointsAsOf);
}

/**
 * Get the ref from a verse record (string or object)
 */
export function getVerseRef(verse: VerseRecord): string {
  return typeof verse === 'string' ? verse : verse.ref;
}

/**
 * Get the addedAt from a verse record
 */
export function getVerseAddedAt(verse: VerseRecord): string | undefined {
  return typeof verse === 'string' ? undefined : verse.addedAt;
}

/**
 * Get the name from a visitor record (string or object)
 */
export function getVisitorName(visitor: VisitorRecord): string {
  return typeof visitor === 'string' ? visitor : visitor.name;
}

/**
 * Get the addedAt from a visitor record
 */
export function getVisitorAddedAt(visitor: VisitorRecord): string | undefined {
  return typeof visitor === 'string' ? undefined : visitor.addedAt;
}

/**
 * Get point value for a rule by activityType
 */
function getRulePointsByActivityType(rules: Rule[], activityType: string): number {
  return rules.find(r => r.activityType === activityType)?.points ?? 0;
}

/**
 * Get point value for a rule by matching description pattern (fallback)
 */
function getRulePointsByPattern(rules: Rule[], pattern: string): number {
  return rules.find(r => r.description.toLowerCase().includes(pattern.toLowerCase()))?.points ?? 0;
}

/**
 * Expand a verse range (e.g., "Mt 6:9-13") to individual verses
 */
function expandVerseRange(ref: string): string[] {
  const match = ref.trim().match(/^([1-3]?\s?[A-Za-zÀ-ÿ]+)\s+(\d+):(\d+)-(\d+)$/);
  if (!match) return [ref];
  const [, book, chapter, startVerse, endVerse] = match;
  const start = parseInt(startVerse, 10);
  const end = parseInt(endVerse, 10);
  if (start > end) return [ref];
  const verses: string[] = [];
  for (let v = start; v <= end; v++) {
    verses.push(`${book} ${chapter}:${v}`);
  }
  return verses;
}

/**
 * Calculate total points for a participant based on their activity records.
 * Points are derived from rules.json values, making them configurable.
 *
 * This function is generic and works with any activity types defined in the config.
 */
export function calculateParticipantPoints(
  participant: Participant,
  rules: Rule[],
  versesData?: VersesData,
  selectedVersion: string = 'NVI',
  gamesData?: GamesData,
  bonusData?: BonusData
): number {
  // Start with baseline points (frozen from before tracking system)
  let total = participant.startPoints ?? 0;

  // Attendance points - use activityType from rules
  participant.attendance?.forEach(a => {
    // First try to get points by activityType match
    const pointsByType = getRulePointsByActivityType(rules, a.type);
    if (pointsByType !== 0) {
      total += pointsByType;
    } else {
      // Fallback to pattern matching for backward compatibility
      if (a.type === 'embaixada') {
        total += getRulePointsByPattern(rules, 'embaixada');
      } else if (a.type === 'igreja') {
        total += getRulePointsByPattern(rules, 'compromissos');
      } else {
        // Generic activity type - try to match by type name
        total += getRulePointsByPattern(rules, a.type);
      }
    }
  });

  // Visitor points
  const visitorPts = getRulePointsByPattern(rules, 'visitante');
  total += (participant.visitors?.length ?? 0) * visitorPts;

  // Verse points - use word count from verses.json (only if feature is enabled)
  if (participant.memorizedVerses && participant.memorizedVerses.length > 0) {
    const smallVersePts = getRulePointsByPattern(rules, '<20') || 25;
    const largeVersePts = getRulePointsByPattern(rules, '>=20') || 35;

    participant.memorizedVerses.forEach(verse => {
      // Handle both string and object format
      const ref = getVerseRef(verse as VerseRecord);
      // Expand ranges (e.g., "Mt 6:9-13") to individual verses
      const expandedRefs = expandVerseRange(ref);
      expandedRefs.forEach(singleRef => {
        const wordCount = versesData?.verses[singleRef]?.[selectedVersion]?.wordCount;
        // If we have word count data, use it; otherwise default to small verse points
        if (wordCount !== undefined) {
          total += wordCount >= 20 ? largeVersePts : smallVersePts;
        } else {
          total += smallVersePts;
        }
      });
    });
  }

  // Candidato progress (Royal Ambassadors specific, but handles gracefully if not present)
  if (participant.candidatoProgress) {
    const prereqPts = getRulePointsByPattern(rules, 'pre-requisitos');
    const manualPts = getRulePointsByPattern(rules, 'tarefa manual');
    if (participant.candidatoProgress.prerequisites) total += prereqPts;
    total += (participant.candidatoProgress.manualTasks ?? 0) * manualPts;
  }

  // Discipline penalties (stored per record with specific point values)
  participant.disciplines?.forEach(d => {
    total += d.points;  // negative values
  });

  // Game points - sum all results for this participant
  gamesData?.games?.forEach(game => {
    game.results
      .filter(r => r.participantId === participant.id)
      .forEach(r => {
        total += r.points;
      });
  });

  // Bonus points - from challenges in bonus.json
  bonusData?.challenges?.forEach(challenge => {
    challenge.results
      .filter(r => r.participantId === participant.id)
      .forEach(r => {
        total += r.points;
      });
  });

  return total;
}

/**
 * Calculate delta points - only activities added after pointsAsOf
 * This is used to show "points gained since X date"
 */
export function calculateDeltaPoints(
  participant: Participant,
  rules: Rule[],
  pointsAsOf: string,
  versesData?: VersesData,
  selectedVersion: string = 'NVI',
  gamesData?: GamesData,
  bonusData?: BonusData
): number {
  let delta = 0;

  // Attendance points - only count if addedAt >= pointsAsOf
  participant.attendance?.forEach(a => {
    const record = a as AttendanceRecordWithTimestamp;
    if (!isAfterDate(record.addedAt, pointsAsOf)) return;

    const pointsByType = getRulePointsByActivityType(rules, a.type);
    if (pointsByType !== 0) {
      delta += pointsByType;
    } else {
      if (a.type === 'embaixada') {
        delta += getRulePointsByPattern(rules, 'embaixada');
      } else if (a.type === 'igreja') {
        delta += getRulePointsByPattern(rules, 'compromissos');
      } else {
        delta += getRulePointsByPattern(rules, a.type);
      }
    }
  });

  // Visitor points - only count if addedAt >= pointsAsOf
  const visitorPts = getRulePointsByPattern(rules, 'visitante');
  participant.visitors?.forEach(v => {
    const visitor = v as VisitorRecord;
    const addedAt = getVisitorAddedAt(visitor);
    if (isAfterDate(addedAt, pointsAsOf)) {
      delta += visitorPts;
    }
  });

  // Verse points - only count if addedAt >= pointsAsOf
  if (participant.memorizedVerses && participant.memorizedVerses.length > 0) {
    const smallVersePts = getRulePointsByPattern(rules, '<20') || 25;
    const largeVersePts = getRulePointsByPattern(rules, '>=20') || 35;

    participant.memorizedVerses.forEach(verse => {
      const verseRecord = verse as VerseRecord;
      const addedAt = getVerseAddedAt(verseRecord);
      if (!isAfterDate(addedAt, pointsAsOf)) return;

      const ref = getVerseRef(verseRecord);
      const expandedRefs = expandVerseRange(ref);
      expandedRefs.forEach(singleRef => {
        const wordCount = versesData?.verses[singleRef]?.[selectedVersion]?.wordCount;
        if (wordCount !== undefined) {
          delta += wordCount >= 20 ? largeVersePts : smallVersePts;
        } else {
          delta += smallVersePts;
        }
      });
    });
  }

  // Note: candidatoProgress, disciplines, games, and bonus are not included in delta
  // as they typically don't have addedAt timestamps

  return delta;
}
