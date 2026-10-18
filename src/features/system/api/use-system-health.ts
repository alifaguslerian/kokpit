import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';

export interface SystemHealthResponse {
  status: string;
}

export function useSystemHealth() {
  return useQuery<SystemHealthResponse>({
    queryKey: queryKeys.system.health(),
    queryFn: () => apiClient.get<SystemHealthResponse>('/api/system/health'),
  });
}
