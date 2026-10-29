import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listIdeas, getIdea, createIdea, updateIdea, deleteIdea, togglePinIdea } from './ideas-api';
import type { Idea, ListIdeasParams, CreateIdeaInput, UpdateIdeaInput } from '../types';

export function useIdeas(params?: ListIdeasParams) {
  return useQuery<Idea[]>({
    queryKey: queryKeys.ideas.list(params as Record<string, unknown> | undefined),
    queryFn: () => listIdeas(params),
  });
}

export function useInfiniteIdeas(params: Omit<ListIdeasParams, 'limit' | 'offset'>) {
  const pageSize = 50;
  return useInfiniteQuery({
    queryKey: [...queryKeys.ideas.all, 'infinite', params],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => listIdeas({ ...params, limit: pageSize, offset: pageParam }),
    getNextPageParam: (lastPage, _pages, lastOffset) =>
      lastPage.length === pageSize ? lastOffset + pageSize : undefined,
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all }),
        queryClient.invalidateQueries({ queryKey: ['idea-collections'] }),
      ]);
    },
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateIdeaInput }) => updateIdea(id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all }),
        queryClient.invalidateQueries({ queryKey: ['idea-collections'] }),
      ]);
    },
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['ideas', 'delete'],
    mutationFn: (id: string) => deleteIdea(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all }),
        queryClient.invalidateQueries({ queryKey: ['idea-collections'] }),
      ]);
    },
  });
}

export function useTogglePinIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned?: boolean | undefined }) =>
      togglePinIdea(id, isPinned),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.ideas.all });
    },
  });
}

export function useUnavailableIdeaIds() {
  return useMutationState({
    filters: { mutationKey: ['ideas', 'delete'] },
    select: (mutation) =>
      mutation.state.status === 'pending' || mutation.state.status === 'success'
        ? (mutation.state.variables as string)
        : null,
  }).filter((id): id is string => id !== null);
}
