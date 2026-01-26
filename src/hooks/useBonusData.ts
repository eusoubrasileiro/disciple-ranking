import { useFetchJson } from "./useFetchJson";

export interface BonusResult {
  participantId: number;
  points: number;
}

export interface BonusChallenge {
  id: number;
  name: string;
  date: string;
  description?: string;
  icon?: string;
  results: BonusResult[];
}

export interface BonusData {
  updatedAt: string;
  challenges: BonusChallenge[];
}

/**
 * Hook to fetch bonus data from the bonus.json file
 */
export const useBonusData = () => useFetchJson<BonusData>("bonus", "bonus.json");
