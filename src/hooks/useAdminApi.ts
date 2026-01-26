import { useMemo } from 'react';
import type { Participant } from '@/hooks/useLeaderboardData';

interface ApiResult<T> {
  data?: T;
  error?: string;
}

interface ApiLeaderboardData {
  season: string;
  updatedAt: string;
  pointsAsOf?: string;
  participants: Participant[];
}

interface ActivityItem {
  type: 'attendance' | 'verse' | 'visitor';
  participantId: number;
  participantName: string;
  index: number;
  data: Record<string, unknown>;
  addedAt: string;
}

/**
 * Generic request handler that wraps fetch with consistent error handling
 */
async function request<T>(
  url: string,
  options?: RequestInit,
  transform?: (data: unknown) => T
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Request failed: ${response.status}`);
    }
    const data = await response.json();
    return { data: transform ? transform(data) : data };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

const jsonHeaders = { 'Content-Type': 'application/json' };

export function useAdminApi() {
  return useMemo(() => ({
    fetchLeaderboard: () =>
      request<ApiLeaderboardData>('/api/leaderboard'),

    addBulkAttendance: (participantIds: number[], date: string, type: string) =>
      request<{ updatedIds: number[] }>(
        '/api/participants/bulk/attendance',
        { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ participantIds, date, type }) },
        (d) => ({ updatedIds: (d as { updatedIds: number[] }).updatedIds })
      ),

    removeAttendance: (participantId: number, index: number) =>
      request<Participant>(
        `/api/participants/${participantId}/attendance/${index}`,
        { method: 'DELETE' },
        (d) => (d as { participant: Participant }).participant
      ),

    addVerse: (participantId: number, ref: string) =>
      request<Participant>(
        `/api/participants/${participantId}/verse`,
        { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ ref }) },
        (d) => (d as { participant: Participant }).participant
      ),

    removeVerse: (participantId: number, index: number) =>
      request<Participant>(
        `/api/participants/${participantId}/verse/${index}`,
        { method: 'DELETE' },
        (d) => (d as { participant: Participant }).participant
      ),

    addVisitor: (participantId: number, name: string) =>
      request<Participant>(
        `/api/participants/${participantId}/visitor`,
        { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ name }) },
        (d) => (d as { participant: Participant }).participant
      ),

    removeVisitor: (participantId: number, index: number) =>
      request<Participant>(
        `/api/participants/${participantId}/visitor/${index}`,
        { method: 'DELETE' },
        (d) => (d as { participant: Participant }).participant
      ),

    updatePointsAsOf: (pointsAsOf: string) =>
      request<{ pointsAsOf: string }>(
        '/api/points-as-of',
        { method: 'PUT', headers: jsonHeaders, body: JSON.stringify({ pointsAsOf }) },
        (d) => ({ pointsAsOf: (d as { pointsAsOf: string }).pointsAsOf })
      ),

    fetchActivityHistory: () =>
      request<{ activities: ActivityItem[] }>('/api/activity-history'),
  }), []);
}
