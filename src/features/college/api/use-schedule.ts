import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as api from './schedule-api';
import type { ScheduleInput } from '../types';

export function useSchedule(semesterId: string) {
  return useQuery({
    queryKey: [...queryKeys.college.all, 'schedule', semesterId],
    queryFn: ({ signal }) => api.listSchedule(semesterId, signal),
    enabled: Boolean(semesterId),
    refetchInterval: 60_000,
  });
}
export function useScheduleActions() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: queryKeys.college.all });
  return {
    create: useMutation({
      mutationFn: ({ courseId, input }: { courseId: string; input: ScheduleInput }) =>
        api.createClass(courseId, input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: ScheduleInput & { courseId: string } }) =>
        api.updateClass(id, input),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: api.deleteClass, onSettled: refresh }),
  };
}
