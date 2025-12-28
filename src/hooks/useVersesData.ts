import { useQuery } from "@tanstack/react-query";

export interface VerseData {
  reference: string;
  text: string;
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
export const useVersesData = () => {
  return useQuery<VersesDataResponse>({
    queryKey: ["verses"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.BASE_URL}data/verses.json`);

      if (!response.ok) {
        throw new Error("Failed to fetch verses data");
      }

      return response.json();
    },
    // Cache for 1 hour
    staleTime: 1000 * 60 * 60,
  });
};
