import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get point value for a rule by activityType
 */
function getRulePointsByActivityType(rules, activityType) {
  return rules.find(r => r.activityType === activityType)?.points ?? 0;
}

/**
 * Get point value for a rule by matching description pattern
 */
function getRulePointsByPattern(rules, pattern) {
  return rules.find(r => r.description.toLowerCase().includes(pattern.toLowerCase()))?.points ?? 0;
}

/**
 * Expand a verse range (e.g., "Mt 6:9-13") to individual verses
 */
function expandVerseRange(ref) {
  const match = ref.trim().match(/^([1-3]?\s?[A-Za-zÀ-ÿ]+)\s+(\d+):(\d+)-(\d+)$/);
  if (!match) return [ref];
  const [, book, chapter, startVerse, endVerse] = match;
  const start = parseInt(startVerse, 10);
  const end = parseInt(endVerse, 10);
  if (start > end) return [ref];
  const verses = [];
  for (let v = start; v <= end; v++) {
    verses.push(`${book} ${chapter}:${v}`);
  }
  return verses;
}

/**
 * Calculate total points for a participant
 * Mirrors the logic from src/lib/calculatePoints.ts
 */
function calculateParticipantPoints(participant, rules, versesData, gamesData) {
  const selectedVersion = versesData?.defaultVersion ?? 'NVI';
  let total = participant.startPoints ?? 0;

  // Attendance points
  participant.attendance?.forEach(a => {
    const pointsByType = getRulePointsByActivityType(rules, a.type);
    if (pointsByType !== 0) {
      total += pointsByType;
    } else {
      if (a.type === 'embaixada') {
        total += getRulePointsByPattern(rules, 'embaixada');
      } else if (a.type === 'igreja') {
        total += getRulePointsByPattern(rules, 'compromissos');
      } else {
        total += getRulePointsByPattern(rules, a.type);
      }
    }
  });

  // Visitor points
  const visitorPts = getRulePointsByPattern(rules, 'visitante');
  total += (participant.visitors?.length ?? 0) * visitorPts;

  // Verse points
  if (participant.memorizedVerses && participant.memorizedVerses.length > 0) {
    const smallVersePts = getRulePointsByPattern(rules, '<20') || 25;
    const largeVersePts = getRulePointsByPattern(rules, '>=20') || 35;

    participant.memorizedVerses.forEach(ref => {
      const expandedRefs = expandVerseRange(ref);
      expandedRefs.forEach(singleRef => {
        const wordCount = versesData?.verses?.[singleRef]?.[selectedVersion]?.wordCount;
        if (wordCount !== undefined) {
          total += wordCount >= 20 ? largeVersePts : smallVersePts;
        } else {
          total += smallVersePts;
        }
      });
    });
  }

  // Candidato progress
  if (participant.candidatoProgress) {
    const prereqPts = getRulePointsByPattern(rules, 'pre-requisitos');
    const manualPts = getRulePointsByPattern(rules, 'tarefa manual');
    if (participant.candidatoProgress.prerequisites) total += prereqPts;
    total += (participant.candidatoProgress.manualTasks ?? 0) * manualPts;
  }

  // Discipline penalties
  participant.disciplines?.forEach(d => {
    total += d.points;
  });

  // Game points
  gamesData?.games?.forEach(game => {
    game.results
      .filter(r => r.participantId === participant.id)
      .forEach(r => {
        total += r.points;
      });
  });

  return total;
}

/**
 * Main function to snapshot current points
 */
async function main() {
  const configDir = process.env.CONFIG_DIR || path.join(__dirname, '..', 'public');
  const dataDir = path.join(configDir, 'data');

  console.log('📸 Creating points snapshot...');
  console.log(`📂 Data directory: ${dataDir}`);

  // Read all required files
  const leaderboardPath = path.join(dataDir, 'leaderboard.json');
  const rulesPath = path.join(dataDir, 'rules.json');
  const versesPath = path.join(dataDir, 'verses.json');
  const gamesPath = path.join(dataDir, 'games.json');

  if (!fs.existsSync(leaderboardPath)) {
    console.error('❌ leaderboard.json not found');
    process.exit(1);
  }
  if (!fs.existsSync(rulesPath)) {
    console.error('❌ rules.json not found');
    process.exit(1);
  }

  const leaderboardData = JSON.parse(fs.readFileSync(leaderboardPath, 'utf-8'));
  const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));

  // Verses and games are optional
  let versesData = null;
  let gamesData = null;

  if (fs.existsSync(versesPath)) {
    versesData = JSON.parse(fs.readFileSync(versesPath, 'utf-8'));
  }
  if (fs.existsSync(gamesPath)) {
    gamesData = JSON.parse(fs.readFileSync(gamesPath, 'utf-8'));
  }

  const now = new Date().toISOString();
  const rules = rulesData.rules;

  // Calculate and store current points for each participant
  let updated = 0;
  leaderboardData.participants.forEach(participant => {
    const currentPoints = calculateParticipantPoints(participant, rules, versesData, gamesData);
    participant.previousPoints = currentPoints;
    participant.previousPointsAt = now;
    updated++;
    console.log(`  ✓ ${participant.name}: ${currentPoints} pts`);
  });

  // Write updated leaderboard
  fs.writeFileSync(leaderboardPath, JSON.stringify(leaderboardData, null, 2) + '\n');

  console.log(`\n✅ Snapshot complete! Updated ${updated} participants.`);
  console.log(`📅 Timestamp: ${now}`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
