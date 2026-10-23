import { apiClient } from '@/lib/api-client';
import type {
  QuickLink,
  ListQuickLinksParams,
  CreateQuickLinkInput,
  UpdateQuickLinkInput,
} from '../types';

export async function listQuickLinks(params?: ListQuickLinksParams): Promise<QuickLink[]> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.group) queryParams.group = params.group;
  if (params?.favorite !== undefined) queryParams.favorite = params.favorite;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const res = await apiClient.get<{ data: QuickLink[] }>('/api/quick-links', {
    params: queryParams,
  });
  return res.data;
}

export async function getQuickLink(id: string): Promise<QuickLink> {
  const res = await apiClient.get<{ data: QuickLink }>(`/api/quick-links/${id}`);
  return res.data;
}

export async function createQuickLink(input: CreateQuickLinkInput): Promise<QuickLink> {
  const res = await apiClient.post<{ data: QuickLink }>('/api/quick-links', input);
  return res.data;
}

export async function updateQuickLink(id: string, input: UpdateQuickLinkInput): Promise<QuickLink> {
  const res = await apiClient.patch<{ data: QuickLink }>(`/api/quick-links/${id}`, input);
  return res.data;
}

export async function deleteQuickLink(id: string): Promise<boolean> {
  const res = await apiClient.delete<{ success: boolean }>(`/api/quick-links/${id}`);
  return res.success;
}

export async function reorderQuickLinks(ids: string[]): Promise<boolean> {
  const res = await apiClient.post<{ success: boolean }>('/api/quick-links/reorder', { ids });
  return res.success;
}

export async function toggleFavoriteQuickLink(
  id: string,
  isFavorite?: boolean | undefined,
): Promise<QuickLink> {
  const res = await apiClient.post<{ data: QuickLink }>(
    `/api/quick-links/${id}/favorite`,
    isFavorite !== undefined ? { isFavorite } : undefined,
  );
  return res.data;
}
