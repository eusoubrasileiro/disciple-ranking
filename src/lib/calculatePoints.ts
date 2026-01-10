import type { Rule, Participant, VersesData } from '@/hooks/useLeaderboardData';

/**
 * Get point value for a rule by matching description pattern
 */
function getRulePoints(rules: Rule[], pattern: string): number {
  return rules.find(r => r.description.includes(pattern))?.points ?? 0;
}

/**
 * Calculate total points for a participant based on their activity records.
 * Points are derived from rules.json values, making them configurable.
 */
export function calculateParticipantPoints(
  participant: Participant,
  rules: Rule[],
  versesData?: VersesData,
  selectedVersion: string = 'NVI'
): number {
  // Start with baseline points (frozen from before tracking system)
  let total = participant.startPoints ?? 0;

  // Attendance points (from rules)
  const embaixadaPts = getRulePoints(rules, 'Embaixada');      // 10
  const igrejaPts = getRulePoints(rules, 'Compromissos');      // 5
  participant.attendance?.forEach(a => {
    total += a.type === 'embaixada' ? embaixadaPts : igrejaPts;
  });

  // Visitor points (from rules)
  const visitorPts = getRulePoints(rules, 'visitante');        // 25
  total += (participant.visitors?.length ?? 0) * visitorPts;

  // Verse points - use word count from verses.json
  const smallVersePts = getRulePoints(rules, '<20');           // 25
  const largeVersePts = getRulePoints(rules, '>=20');          // 35
  participant.memorizedVerses?.forEach(ref => {
    const wordCount = versesData?.verses[ref]?.[selectedVersion]?.wordCount;
    // If we have word count data, use it; otherwise default to small verse points
    if (wordCount !== undefined) {
      total += wordCount >= 20 ? largeVersePts : smallVersePts;
    } else {
      total += smallVersePts;
    }
  });

  // Candidato progress (from rules)
  const prereqPts = getRulePoints(rules, 'Pre-requisitos');    // 55
  const manualPts = getRulePoints(rules, 'Tarefa Manual');     // 55 per task (10 tasks total)
  if (participant.candidatoProgress?.prerequisites) total += prereqPts;
  total += (participant.candidatoProgress?.manualTasks ?? 0) * manualPts;

  // Discipline penalties (stored per record with specific point values)
  participant.disciplines?.forEach(d => {
    total += d.points;  // negative values
  });

  return total;
}
