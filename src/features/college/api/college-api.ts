import { apiClient } from '@/lib/api-client';
import type {
  Semester,
  Course,
  Week,
  CreateSemesterInput,
  UpdateSemesterInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateWeekInput,
  UpdateWeekInput,
} from '../types';

const base = '/api/college';
const requestOptions = (signal?: AbortSignal) => (signal ? { signal } : {});

export async function listSemesters(signal?: AbortSignal): Promise<Semester[]> {
  return (await apiClient.get<{ data: Semester[] }>(`${base}/semesters`, requestOptions(signal)))
    .data;
}

export async function getSemester(id: string, signal?: AbortSignal): Promise<Semester> {
  return (
    await apiClient.get<{ data: Semester }>(
      `${base}/semesters/${encodeURIComponent(id)}`,
      requestOptions(signal),
    )
  ).data;
}

export async function createSemester(
  input: CreateSemesterInput,
  signal?: AbortSignal,
): Promise<Semester> {
  return (
    await apiClient.post<{ data: Semester }>(`${base}/semesters`, input, requestOptions(signal))
  ).data;
}

export async function updateSemester(
  id: string,
  input: UpdateSemesterInput,
  signal?: AbortSignal,
): Promise<Semester> {
  return (
    await apiClient.patch<{ data: Semester }>(
      `${base}/semesters/${encodeURIComponent(id)}`,
      input,
      requestOptions(signal),
    )
  ).data;
}

export async function deleteSemester(id: string, signal?: AbortSignal): Promise<boolean> {
  return (
    await apiClient.delete<{ success: boolean }>(
      `${base}/semesters/${encodeURIComponent(id)}`,
      requestOptions(signal),
    )
  ).success;
}

export async function reorderSemesters(ids: string[], signal?: AbortSignal): Promise<boolean> {
  return (
    await apiClient.post<{ success: boolean }>(
      `${base}/semesters/reorder`,
      { ids },
      requestOptions(signal),
    )
  ).success;
}

export async function listCourses(semesterId: string, signal?: AbortSignal): Promise<Course[]> {
  return (
    await apiClient.get<{ data: Course[] }>(
      `${base}/semesters/${encodeURIComponent(semesterId)}/courses`,
      requestOptions(signal),
    )
  ).data;
}

export async function getCourse(id: string, signal?: AbortSignal): Promise<Course> {
  return (
    await apiClient.get<{ data: Course }>(
      `${base}/courses/${encodeURIComponent(id)}`,
      requestOptions(signal),
    )
  ).data;
}

export async function createCourse(
  semesterId: string,
  input: CreateCourseInput,
  signal?: AbortSignal,
): Promise<Course> {
  return (
    await apiClient.post<{ data: Course }>(
      `${base}/semesters/${encodeURIComponent(semesterId)}/courses`,
      input,
      requestOptions(signal),
    )
  ).data;
}

export async function updateCourse(
  id: string,
  input: UpdateCourseInput,
  signal?: AbortSignal,
): Promise<Course> {
  return (
    await apiClient.patch<{ data: Course }>(
      `${base}/courses/${encodeURIComponent(id)}`,
      input,
      requestOptions(signal),
    )
  ).data;
}

export async function deleteCourse(id: string, signal?: AbortSignal): Promise<boolean> {
  return (
    await apiClient.delete<{ success: boolean }>(
      `${base}/courses/${encodeURIComponent(id)}`,
      requestOptions(signal),
    )
  ).success;
}

export async function reorderCourses(
  semesterId: string,
  ids: string[],
  signal?: AbortSignal,
): Promise<boolean> {
  return (
    await apiClient.post<{ success: boolean }>(
      `${base}/semesters/${encodeURIComponent(semesterId)}/courses/reorder`,
      { ids },
      requestOptions(signal),
    )
  ).success;
}

export async function listWeeks(courseId: string, signal?: AbortSignal): Promise<Week[]> {
  return (
    await apiClient.get<{ data: Week[] }>(
      `${base}/courses/${encodeURIComponent(courseId)}/weeks`,
      requestOptions(signal),
    )
  ).data;
}

export async function getWeek(id: string, signal?: AbortSignal): Promise<Week> {
  return (
    await apiClient.get<{ data: Week }>(
      `${base}/weeks/${encodeURIComponent(id)}`,
      requestOptions(signal),
    )
  ).data;
}

export async function createWeek(
  courseId: string,
  input: CreateWeekInput,
  signal?: AbortSignal,
): Promise<Week> {
  return (
    await apiClient.post<{ data: Week }>(
      `${base}/courses/${encodeURIComponent(courseId)}/weeks`,
      input,
      requestOptions(signal),
    )
  ).data;
}

export async function updateWeek(
  id: string,
  input: UpdateWeekInput,
  signal?: AbortSignal,
): Promise<Week> {
  return (
    await apiClient.patch<{ data: Week }>(
      `${base}/weeks/${encodeURIComponent(id)}`,
      input,
      requestOptions(signal),
    )
  ).data;
}

export async function deleteWeek(id: string, signal?: AbortSignal): Promise<boolean> {
  return (
    await apiClient.delete<{ success: boolean }>(
      `${base}/weeks/${encodeURIComponent(id)}`,
      requestOptions(signal),
    )
  ).success;
}
