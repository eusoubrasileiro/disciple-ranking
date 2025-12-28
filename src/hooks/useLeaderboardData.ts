import { useState, useEffect } from 'react';

export interface Rule {
  id: number;
  description: string;
  points: number;
  icon?: string;
  explanation?: string;
}

export interface Participant {
  id: number;
  name: string;
  points: number;
  memorizedVerses?: string[];
}

export interface LeaderboardData {
  season: string;
  updatedAt: string;
  rules: Rule[];
  participants: Participant[];
}

export function useLeaderboardData() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/leaderboard.json`);
        if (!response.ok) {
          throw new Error('Falha ao carregar dados');
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedParticipants = data?.participants
    .slice()
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.name.localeCompare(b.name);
    }) ?? [];

  return { data, loading, error, sortedParticipants };
}
