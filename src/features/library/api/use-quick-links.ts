import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  listQuickLinks,
  getQuickLink,
  createQuickLink,
  updateQuickLink,
  deleteQuickLink,
  reorderQuickLinks,
  toggleFavoriteQuickLink,
} from './quick-links-api';
import type {
  QuickLink,
  ListQuickLinksParams,
  CreateQuickLinkInput,
  UpdateQuickLinkInput,
} from '../types';

export function useQuickLinks(params?: ListQuickLinksParams) {
  return useQuery<QuickLink[]>({
    queryKey: [...queryKeys.library.links(), params],
    queryFn: () => listQuickLinks(params),
  });
}

export function useQuickLink(id: string) {
  return useQuery<QuickLink>({
    queryKey: [...queryKeys.library.all, 'link', id],
    queryFn: () => getQuickLink(id),
    enabled: Boolean(id),
  });
}

export function useCreateQuickLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateQuickLinkInput) => createQuickLink(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
    },
  });
}

export function useUpdateQuickLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateQuickLinkInput }) =>
      updateQuickLink(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
    },
  });
}

export function useDeleteQuickLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuickLink(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
    },
  });
}

export function useReorderQuickLinks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => reorderQuickLinks(ids),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
    },
  });
}

export function useToggleFavoriteQuickLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite?: boolean | undefined }) =>
      toggleFavoriteQuickLink(id, isFavorite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.library.all });
    },
  });
}
