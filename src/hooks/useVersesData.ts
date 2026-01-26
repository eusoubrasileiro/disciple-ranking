import { useFetchJson } from "./useFetchJson";

export interface VerseData {
  reference: string;
  text: string;
  wordCount: number;
  youversionUrl: string;
}

export interface BibleVersionInfo {
  id: number;
  name: string;
  fullTitle: string;
}

export interface VersesDataResponse {
  generatedAt: string;
  defaultVersion: string;
  versions: Record<string, BibleVersionInfo>;
  verses: Record<string, Record<string, VerseData>>;
}

/**
 * Hook to fetch verses data from the generated verses.json file
 */
export const useVersesData = () => useFetchJson<VersesDataResponse>("verses", "verses.json");
