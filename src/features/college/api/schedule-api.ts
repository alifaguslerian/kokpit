import { apiClient } from '@/lib/api-client';
import type { ScheduleEntry, ScheduleInput, ScheduleResponse } from '../types';
const base = '/api/college';
export function listSchedule(semesterId: string, signal: AbortSignal) {
  return apiClient.get<ScheduleResponse>(
    `${base}/semesters/${encodeURIComponent(semesterId)}/schedule`,
    { signal },
  );
}
export async function createClass(courseId: string, input: ScheduleInput) {
  return (
    await apiClient.post<{ data: ScheduleEntry }>(
      `${base}/courses/${encodeURIComponent(courseId)}/schedule`,
      input,
    )
  ).data;
}
export async function updateClass(id: string, input: ScheduleInput & { courseId: string }) {
  return (
    await apiClient.patch<{ data: ScheduleEntry }>(
      `${base}/schedule/${encodeURIComponent(id)}`,
      input,
    )
  ).data;
}
export function deleteClass(id: string) {
  return apiClient.delete<{ success: boolean }>(`${base}/schedule/${encodeURIComponent(id)}`);
}
