export interface Semester {
  id: string;
  userId: string;
  name: string;
  academicYear: string | null;
  termNumber: number | null;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  userId: string;
  semesterId: string;
  name: string;
  code: string | null;
  lecturer: string | null;
  accentKey: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Week {
  id: string;
  userId: string;
  courseId: string;
  weekNumber: number;
  title: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSemesterInput {
  name: string;
  academicYear?: string | null | undefined;
  termNumber?: number | null | undefined;
  isActive?: boolean | undefined;
}

export type UpdateSemesterInput = Partial<CreateSemesterInput>;

export interface CreateCourseInput {
  name: string;
  code?: string | null | undefined;
  lecturer?: string | null | undefined;
  accentKey?: string | null | undefined;
}

export type UpdateCourseInput = Partial<CreateCourseInput>;

export interface CreateWeekInput {
  weekNumber: number;
  title?: string | null | undefined;
  notes?: string | null | undefined;
}

export type UpdateWeekInput = Partial<CreateWeekInput>;
