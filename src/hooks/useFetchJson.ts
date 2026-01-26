import { useQuery, UseQueryResult } from "@tanstack/react-query";

/**
 * Generic hook factory for fetching JSON data files.
 * All hooks use 1-hour cache by default.
 */
export function useFetchJson<T>(
  key: string,
  filename: string,
  options?: { staleTime?: number }
): UseQueryResult<T> {
  return useQuery<T>({
    queryKey: [key],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.BASE_URL}data/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filename} (HTTP ${response.status})`);
      }
      return response.json();
    },
    staleTime: options?.staleTime ?? 1000 * 60 * 60, // 1 hour default
  });
}
