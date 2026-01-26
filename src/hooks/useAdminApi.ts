import { useCallback, useMemo } from 'react';
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

export function useAdminApi() {
  const fetchLeaderboard = useCallback(async (): Promise<ApiResult<ApiLeaderboardData>> => {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      return { data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  const addBulkAttendance = useCallback(async (
    participantIds: number[],
    date: string,
    type: string
  ): Promise<ApiResult<{ updatedIds: number[] }>> => {
    try {
      const response = await fetch('/api/participants/bulk/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds, date, type })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add bulk attendance');
      }
      const result = await response.json();
      return { data: { updatedIds: result.updatedIds } };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  const removeAttendance = useCallback(async (
    participantId: number,
    index: number
  ): Promise<ApiResult<Participant>> => {
    try {
      const response = await fetch(`/api/participants/${participantId}/attendance/${index}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to remove attendance');
      }
      const result = await response.json();
      return { data: result.participant };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  const addVerse = useCallback(async (
    participantId: number,
    ref: string
  ): Promise<ApiResult<Participant>> => {
    try {
      const response = await fetch(`/api/participants/${participantId}/verse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add verse');
      }
      const result = await response.json();
      return { data: result.participant };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  const removeVerse = useCallback(async (
    participantId: number,
    index: number
  ): Promise<ApiResult<Participant>> => {
    try {
      const response = await fetch(`/api/participants/${participantId}/verse/${index}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to remove verse');
      }
      const result = await response.json();
      return { data: result.participant };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  const addVisitor = useCallback(async (
    participantId: number,
    name: string
  ): Promise<ApiResult<Participant>> => {
    try {
      const response = await fetch(`/api/participants/${participantId}/visitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add visitor');
      }
      const result = await response.json();
      return { data: result.participant };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  const removeVisitor = useCallback(async (
    participantId: number,
    index: number
  ): Promise<ApiResult<Participant>> => {
    try {
      const response = await fetch(`/api/participants/${participantId}/visitor/${index}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to remove visitor');
      }
      const result = await response.json();
      return { data: result.participant };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  const updatePointsAsOf = useCallback(async (
    pointsAsOf: string
  ): Promise<ApiResult<{ pointsAsOf: string }>> => {
    try {
      const response = await fetch('/api/points-as-of', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsAsOf })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update pointsAsOf');
      }
      const result = await response.json();
      return { data: { pointsAsOf: result.pointsAsOf } };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  const fetchActivityHistory = useCallback(async (): Promise<ApiResult<{ activities: ActivityItem[] }>> => {
    try {
      const response = await fetch('/api/activity-history');
      if (!response.ok) {
        throw new Error('Failed to fetch activity history');
      }
      const data = await response.json();
      return { data };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  return useMemo(() => ({
    fetchLeaderboard,
    addBulkAttendance,
    removeAttendance,
    addVerse,
    removeVerse,
    addVisitor,
    removeVisitor,
    updatePointsAsOf,
    fetchActivityHistory
  }), [
    fetchLeaderboard,
    addBulkAttendance,
    removeAttendance,
    addVerse,
    removeVerse,
    addVisitor,
    removeVisitor,
    updatePointsAsOf,
    fetchActivityHistory
  ]);
}
