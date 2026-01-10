import { useState, useEffect } from 'react';
import { calculateParticipantPoints } from '@/lib/calculatePoints';

export interface Rule {
  id: number;
  description: string;
  points: number;
  icon?: string;
  explanation?: string;
}

// Activity tracking types
export interface AttendanceRecord {
  date: string;        // ISO date
  type: 'embaixada' | 'igreja';
}

export interface CandidatoProgress {
  prerequisites?: boolean;      // 55pts when true (1 task)
  manualTasks?: number;         // 0-10, each task = 55pts (10 tasks in Manual do Candidato)
}

export interface DisciplineRecord {
  date: string;
  points: number;  // -10, -7, or -5 depending on member type
  reason?: string;
}

// Verses data structure (from verses.json)
export interface VerseInfo {
  reference: string;
  text: string;
  wordCount: number;
  youversionUrl: string;
}

export interface VersesData {
  generatedAt: string;
  defaultVersion: string;
  versions: Record<string, { id: number; name: string; fullTitle: string }>;
  verses: Record<string, Record<string, VerseInfo>>;
}

export interface Participant {
  id: number;
  name: string;
  startPoints?: number;  // Baseline points from before tracking system
  points?: number;       // Legacy field - ignored when computing
  memorizedVerses?: string[];
  visitors?: string[];
  attendance?: AttendanceRecord[];
  candidatoProgress?: CandidatoProgress;
  disciplines?: DisciplineRecord[];
}

// Participant with computed points for display
export interface ParticipantWithPoints extends Omit<Participant, 'points'> {
  points: number;
}

interface RawLeaderboardData {
  season: string;
  updatedAt: string;
  participants: Participant[];
}

interface RulesData {
  rules: Rule[];
}

export interface LeaderboardData {
  season: string;
  updatedAt: string;
  rules: Rule[];
  participants: Participant[];
  versesData?: VersesData;
}

export function useLeaderboardData() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardResponse, rulesResponse, versesResponse] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}data/leaderboard.json`),
          fetch(`${import.meta.env.BASE_URL}data/rules.json`),
          fetch(`${import.meta.env.BASE_URL}data/verses.json`)
        ]);

        if (!leaderboardResponse.ok || !rulesResponse.ok) {
          throw new Error('Falha ao carregar dados');
        }

        const [leaderboardData, rulesData]: [RawLeaderboardData, RulesData] = await Promise.all([
          leaderboardResponse.json(),
          rulesResponse.json()
        ]);

        // Verses data is optional - app should work without it
        let versesData: VersesData | undefined;
        if (versesResponse.ok) {
          versesData = await versesResponse.json();
        }

        setData({
          ...leaderboardData,
          rules: rulesData.rules,
          versesData
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute points for each participant from their activity records
  const sortedParticipants: ParticipantWithPoints[] = (data?.participants ?? [])
    .map(participant => ({
      ...participant,
      points: calculateParticipantPoints(
        participant,
        data?.rules ?? [],
        data?.versesData,
        data?.versesData?.defaultVersion ?? 'NVI'
      )
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.name.localeCompare(b.name);
    });

  return { data, loading, error, sortedParticipants };
}
