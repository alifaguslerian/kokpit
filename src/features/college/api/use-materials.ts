import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as api from './materials-api';
import type { MaterialChanges } from '../types';

export function useWeekMaterials(weekId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.college.materials(weekId),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => api.listWeekMaterials(weekId, pageParam, signal),
    getNextPageParam: (page, pages) => (page.length === 20 ? pages.length * 20 : undefined),
    enabled: Boolean(weekId),
  });
}
export function useSemesterMaterials(semesterId: string) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.college.all, 'materials', 'semester', semesterId],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      api.listSemesterMaterials(semesterId, 20, pageParam, signal),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: Boolean(semesterId),
  });
}
export function useRecentMaterials(semesterId: string) {
  return useQuery({
    queryKey: [...queryKeys.college.all, 'materials', 'recent', semesterId],
    queryFn: ({ signal }) => api.listSemesterMaterials(semesterId, 3, undefined, signal),
    enabled: Boolean(semesterId),
  });
}
export function useMaterialActions() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: queryKeys.college.all });
  const upload = useMutation({
    mutationFn: ({ weekId, file, title }: { weekId: string; file: File; title: string }) =>
      api.uploadMaterial(weekId, file, title),
    onSuccess: refresh,
  });
  const createLink = useMutation({
    mutationFn: ({ weekId, title, url }: { weekId: string; title: string; url: string }) =>
      api.createMaterialLink(weekId, title, url),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: MaterialChanges }) =>
      api.updateMaterial(id, input),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: api.deleteMaterial, onSettled: refresh });
  return { upload, createLink, update, remove };
}
