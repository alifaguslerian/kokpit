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
  description: string | null;
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
  description?: string | null | undefined;
  accentKey?: string | null | undefined;
}

export type UpdateCourseInput = Partial<CreateCourseInput>;

export interface CreateWeekInput {
  weekNumber: number;
  title?: string | null | undefined;
  notes?: string | null | undefined;
}

export type UpdateWeekInput = Partial<CreateWeekInput>;

export interface ScheduleEntry {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string | null;
  semesterId: string;
  weekday: number;
  startMinute: number;
  endMinute: number;
  room: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface ScheduleInput {
  weekday: number;
  startMinute: number;
  endMinute: number;
  room?: string | null;
}
export interface ScheduleResponse {
  data: ScheduleEntry[];
  timezone: string;
  week: {
    start: string;
    end: string;
    today: string;
    days: Array<{ weekday: number; date: string }>;
  };
}

export interface Material {
  id: string;
  weekId: string;
  type: 'file' | 'link';
  title: string;
  originalFilename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  externalUrl: string | null;
  fileUrl: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  courseId: string;
  courseName: string;
  semesterId: string;
  weekNumber: number;
}
export interface MaterialChanges {
  title?: string;
  externalUrl?: string;
  weekId?: string;
}
