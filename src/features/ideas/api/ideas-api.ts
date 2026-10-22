import { apiClient } from '@/lib/api-client';
import type { Idea, ListIdeasParams, CreateIdeaInput, UpdateIdeaInput } from '../types';

export async function listIdeas(params?: ListIdeasParams): Promise<Idea[]> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.q) queryParams.q = params.q;
  if (params?.tag) queryParams.tag = params.tag;
  if (params?.pinned !== undefined) queryParams.pinned = params.pinned;
  if (params?.limit !== undefined) queryParams.limit = params.limit;
  if (params?.offset !== undefined) queryParams.offset = params.offset;

  const res = await apiClient.get<{ data: Idea[] }>('/api/ideas', {
    params: queryParams,
  });
  return res.data;
}

export async function getIdea(id: string): Promise<Idea> {
  const res = await apiClient.get<{ data: Idea }>(`/api/ideas/${id}`);
  return res.data;
}

export async function createIdea(input: CreateIdeaInput): Promise<Idea> {
  const res = await apiClient.post<{ data: Idea }>('/api/ideas', input);
  return res.data;
}

export async function updateIdea(id: string, input: UpdateIdeaInput): Promise<Idea> {
  const res = await apiClient.patch<{ data: Idea }>(`/api/ideas/${id}`, input);
  return res.data;
}

export async function deleteIdea(id: string): Promise<boolean> {
  const res = await apiClient.delete<{ success: boolean }>(`/api/ideas/${id}`);
  return res.success;
}

export async function togglePinIdea(id: string, isPinned?: boolean): Promise<Idea> {
  const res = await apiClient.post<{ data: Idea }>(
    `/api/ideas/${id}/pin`,
    isPinned !== undefined ? { isPinned } : undefined,
  );
  return res.data;
}
