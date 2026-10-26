import { apiClient } from '@/lib/api-client';
import type { Material, MaterialChanges } from '../types';

const base = '/api/college';
const id = encodeURIComponent;
export async function listWeekMaterials(weekId: string, offset: number, signal: AbortSignal) {
  return (
    await apiClient.get<{ data: Material[] }>(`${base}/weeks/${id(weekId)}/materials`, {
      params: { limit: 20, offset },
      signal,
    })
  ).data;
}
export function listSemesterMaterials(
  semesterId: string,
  limit: number,
  cursor: string | undefined,
  signal: AbortSignal,
) {
  return apiClient.get<{ data: Material[]; nextCursor: string | null }>(
    `${base}/semesters/${id(semesterId)}/materials`,
    {
      params: { limit, cursor, sort: 'updated' },
      signal,
    },
  );
}
export async function uploadMaterial(weekId: string, file: File, title: string) {
  return (
    await apiClient.post<{ data: Material }>(`${base}/weeks/${id(weekId)}/materials/upload`, file, {
      params: { filename: file.name, sizeBytes: file.size, title: title.trim() || file.name },
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    })
  ).data;
}
export async function createMaterialLink(weekId: string, title: string, externalUrl: string) {
  return (
    await apiClient.post<{ data: Material }>(`${base}/weeks/${id(weekId)}/materials`, {
      title,
      externalUrl,
    })
  ).data;
}
export async function updateMaterial(materialId: string, input: MaterialChanges) {
  return (await apiClient.patch<{ data: Material }>(`${base}/materials/${id(materialId)}`, input))
    .data;
}
export function deleteMaterial(materialId: string) {
  return apiClient.delete<{ success: boolean }>(`${base}/materials/${id(materialId)}`);
}
