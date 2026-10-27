import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import * as api from './college-api';
import type {
  CreateSemesterInput,
  UpdateSemesterInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateWeekInput,
  UpdateWeekInput,
} from '../types';

export function useSemesters() {
  return useQuery({
    queryKey: queryKeys.college.semesters(),
    queryFn: ({ signal }) => api.listSemesters(signal),
  });
}

export function useSemester(id: string) {
  return useQuery({
    queryKey: queryKeys.college.semester(id),
    queryFn: ({ signal }) => api.getSemester(id, signal),
    enabled: Boolean(id),
  });
}

export function useCourses(semesterId: string) {
  return useQuery({
    queryKey: queryKeys.college.courses(semesterId),
    queryFn: ({ signal }) => api.listCourses(semesterId, signal),
    enabled: Boolean(semesterId),
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: queryKeys.college.course(id),
    queryFn: ({ signal }) => api.getCourse(id, signal),
    enabled: Boolean(id),
  });
}

export function useWeeks(courseId: string) {
  return useQuery({
    queryKey: queryKeys.college.weeks(courseId),
    queryFn: ({ signal }) => api.listWeeks(courseId, signal),
    enabled: Boolean(courseId),
  });
}

export function useWeek(id: string) {
  return useQuery({
    queryKey: queryKeys.college.week(id),
    queryFn: ({ signal }) => api.getWeek(id, signal),
    enabled: Boolean(id),
  });
}

function useInvalidateCollege() {
  const queryClient = useQueryClient();
  // Home subscribes to these same keys for its College preview.
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.college.all });
}

export function useCreateSemester() {
  const invalidate = useInvalidateCollege();
  return useMutation({
    mutationFn: (input: CreateSemesterInput) => api.createSemester(input),
    onSuccess: invalidate,
  });
}

export function useUpdateSemester() {
  const invalidate = useInvalidateCollege();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSemesterInput }) =>
      api.updateSemester(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteSemester() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateCollege();
  return useMutation({
    mutationFn: (id: string) => api.deleteSemester(id),
    onError: invalidate,
    onSuccess: async (_result, id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.college.all });
      queryClient.removeQueries({ queryKey: queryKeys.college.semester(id) });
      // Descendant queries may outlive their parent list, so clear all deeper levels.
      queryClient.removeQueries({
        queryKey: queryKeys.college.all,
        predicate: ({ queryKey }) =>
          ['courses', 'course', 'weeks', 'week', 'materials', 'schedule'].includes(
            String(queryKey[1]),
          ),
      });
      await invalidate();
    },
  });
}

export function useReorderSemesters() {
  const invalidate = useInvalidateCollege();
  return useMutation({
    mutationFn: (ids: string[]) => api.reorderSemesters(ids),
    onSuccess: invalidate,
  });
}

export function useCreateCourse() {
  const invalidate = useInvalidateCollege();
  return useMutation({
    mutationFn: ({ semesterId, input }: { semesterId: string; input: CreateCourseInput }) =>
      api.createCourse(semesterId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateCourse() {
  const invalidate = useInvalidateCollege();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCourseInput }) =>
      api.updateCourse(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateCollege();
  return useMutation({
    mutationFn: (id: string) => api.deleteCourse(id),
    onError: invalidate,
    onSuccess: async (_result, id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.college.all });
      queryClient.removeQueries({ queryKey: queryKeys.college.course(id) });
      queryClient.removeQueries({
        queryKey: queryKeys.college.all,
        predicate: ({ queryKey }) =>
          ['weeks', 'week', 'materials', 'schedule'].includes(String(queryKey[1])),
      });
      await invalidate();
    },
  });
}

export function useReorderCourses() {
  const invalidate = useInvalidateCollege();
  return useMutation({
    mutationFn: ({ semesterId, ids }: { semesterId: string; ids: string[] }) =>
      api.reorderCourses(semesterId, ids),
    onSuccess: invalidate,
  });
}

export function useCreateWeek() {
  const invalidate = useInvalidateCollege();
  return useMutation({
    mutationFn: ({ courseId, input }: { courseId: string; input: CreateWeekInput }) =>
      api.createWeek(courseId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateWeek() {
  const invalidate = useInvalidateCollege();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWeekInput }) =>
      api.updateWeek(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteWeek() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateCollege();
  return useMutation({
    mutationFn: (id: string) => api.deleteWeek(id),
    onError: invalidate,
    onSuccess: async (_result, id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.college.all });
      queryClient.removeQueries({ queryKey: queryKeys.college.week(id) });
      queryClient.removeQueries({ queryKey: queryKeys.college.materials(id) });
      await invalidate();
    },
  });
}
