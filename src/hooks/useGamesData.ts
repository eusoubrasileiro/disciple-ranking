import { useFetchJson } from "./useFetchJson";

export interface GameRule {
  position: number;
  label: string;
  points: number;
}

export interface GameResult {
  participantId: number;
  position: number;
  points: number;
}

export interface Game {
  id: number;
  name: string;
  date: string;
  description?: string;
  icon?: string;
  rules?: GameRule[];
  results: GameResult[];
}

export interface GamesData {
  updatedAt: string;
  defaultRules: GameRule[];
  games: Game[];
}

/**
 * Hook to fetch games data from the games.json file
 */
export const useGamesData = () => useFetchJson<GamesData>("games", "games.json");
