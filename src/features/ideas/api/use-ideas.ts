import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listIdeas, getIdea, createIdea, updateIdea, deleteIdea, togglePinIdea } from './ideas-api';
import type { Idea, ListIdeasParams, CreateIdeaInput, UpdateIdeaInput } from '../types';

export function useIdeas(params?: ListIdeasParams) {
  return useQuery<Idea[]>({
    queryKey: queryKeys.ideas.list(params as Record<string, unknown> | undefined),
    queryFn: () => listIdeas(params),
  });
}

export function useIdea(id: string) {
  return useQuery<Idea>({
    queryKey: queryKeys.ideas.detail(id),
    queryFn: () => getIdea(id),
    enabled: Boolean(id),
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIdeaInput) => createIdea(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
    },
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateIdeaInput }) => updateIdea(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
    },
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteIdea(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
    },
  });
}

export function useTogglePinIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned?: boolean | undefined }) =>
      togglePinIdea(id, isPinned),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
    },
  });
}
