/**
 * Verse utility functions for handling Bible verse references, ranges, and points calculation.
 * Consolidated from calculatePoints.ts and Versiculos.tsx to avoid duplication.
 */

// Points thresholds - configurable from rules.json, but these are defaults
const VERSE_WORD_THRESHOLD = 20;
const SMALL_VERSE_POINTS = 25;
const LARGE_VERSE_POINTS = 35;

/**
 * Check if a reference is a verse range (e.g., "Mt 6:9-13")
 */
export function isVerseRange(ref: string): boolean {
  return /^([1-3]?\s?[A-Za-zÀ-ÿ]+)\s+(\d+):(\d+)-(\d+)$/.test(ref.trim());
}

/**
 * Expand a verse range (e.g., "Mt 6:9-13") into individual verse references.
 * Returns the original reference in an array if it's not a range.
 */
export function expandVerseRange(ref: string): string[] {
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
 * Calculate points for a single verse based on word count.
 * Uses default values if custom points not provided.
 */
export function calculateVersePoints(
  wordCount: number,
  smallVersePts: number = SMALL_VERSE_POINTS,
  largeVersePts: number = LARGE_VERSE_POINTS
): number {
  return wordCount >= VERSE_WORD_THRESHOLD ? largeVersePts : smallVersePts;
}
