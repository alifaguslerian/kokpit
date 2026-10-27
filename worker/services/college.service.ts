import type { CollegeRepository } from '../db/repositories/college.repository';
import { AppError, NotFoundError } from '../utils/errors';
import type { MaterialsService } from './materials.service';

export interface SemesterInput {
  name: string;
  academicYear?: string | null | undefined;
  termNumber?: number | null | undefined;
  isActive?: boolean | undefined;
}
export interface CourseInput {
  name: string;
  code?: string | null | undefined;
  lecturer?: string | null | undefined;
  description?: string | null | undefined;
  accentKey?: string | null | undefined;
}
export interface WeekInput {
  weekNumber: number;
  title?: string | null | undefined;
  notes?: string | null | undefined;
}
type Changes<T> = { [Field in keyof T]?: T[Field] | undefined };

const textOrNull = (value: string | null | undefined) => value?.trim() || null;
const conflict = (message: string) => new AppError('CONFLICT', message, 409);

export class CollegeService {
  constructor(
    private readonly repository: CollegeRepository,
    private readonly materials: MaterialsService,
  ) {}

  listSemesters(userId: string) {
    return this.repository.listSemesters(userId);
  }

  async getSemester(id: string, userId: string) {
    const semester = await this.repository.findSemester(id, userId);
    if (!semester) throw new NotFoundError('Semester not found.');
    return semester;
  }

  createSemester(userId: string, input: SemesterInput) {
    const now = new Date().toISOString();
    return this.repository.createSemester({
      id: crypto.randomUUID(),
      userId,
      name: input.name.trim(),
      academicYear: textOrNull(input.academicYear),
      termNumber: input.termNumber ?? null,
      isActive: input.isActive ? 1 : 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  async updateSemester(id: string, userId: string, input: Changes<SemesterInput>) {
    await this.getSemester(id, userId);
    const updated = await this.repository.updateSemester(id, userId, {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.academicYear !== undefined ? { academicYear: textOrNull(input.academicYear) } : {}),
      ...(input.termNumber !== undefined ? { termNumber: input.termNumber } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive ? 1 : 0 } : {}),
      updatedAt: new Date().toISOString(),
    });
    if (!updated) throw new NotFoundError('Semester not found.');
    return updated;
  }

  async deleteSemester(id: string, userId: string) {
    await this.getSemester(id, userId);
    await this.materials.deleteWithin('semester', id, userId);
    if (!(await this.repository.deleteSemester(id, userId))) {
      throw conflict('Semester contains stored files or inaccessible descendants.');
    }
  }

  async reorderSemesters(userId: string, ids: string[]) {
    if (!(await this.repository.reorderSemesters(userId, ids, new Date().toISOString()))) {
      throw conflict('Semester list changed. Refresh and try again.');
    }
  }

  async listCourses(semesterId: string, userId: string) {
    await this.getSemester(semesterId, userId);
    return this.repository.listCourses(semesterId, userId);
  }

  async getCourse(id: string, userId: string) {
    const course = await this.repository.findCourse(id, userId);
    if (!course) throw new NotFoundError('Course not found.');
    return course;
  }

  async createCourse(semesterId: string, userId: string, input: CourseInput) {
    await this.getSemester(semesterId, userId);
    const now = new Date().toISOString();
    return this.repository.createCourse({
      id: crypto.randomUUID(),
      userId,
      semesterId,
      name: input.name.trim(),
      code: textOrNull(input.code),
      lecturer: textOrNull(input.lecturer),
      description: textOrNull(input.description),
      accentKey: textOrNull(input.accentKey),
      createdAt: now,
      updatedAt: now,
    });
  }

  async updateCourse(id: string, userId: string, input: Changes<CourseInput>) {
    await this.getCourse(id, userId);
    const updated = await this.repository.updateCourse(id, userId, {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.code !== undefined ? { code: textOrNull(input.code) } : {}),
      ...(input.lecturer !== undefined ? { lecturer: textOrNull(input.lecturer) } : {}),
      ...(input.description !== undefined ? { description: textOrNull(input.description) } : {}),
      ...(input.accentKey !== undefined ? { accentKey: textOrNull(input.accentKey) } : {}),
      updatedAt: new Date().toISOString(),
    });
    if (!updated) throw new NotFoundError('Course not found.');
    return updated;
  }

  async deleteCourse(id: string, userId: string) {
    await this.getCourse(id, userId);
    await this.materials.deleteWithin('course', id, userId);
    if (!(await this.repository.deleteCourse(id, userId))) {
      throw conflict('Course contains stored files or inaccessible descendants.');
    }
  }

  async reorderCourses(semesterId: string, userId: string, ids: string[]) {
    await this.getSemester(semesterId, userId);
    if (
      !(await this.repository.reorderCourses(semesterId, userId, ids, new Date().toISOString()))
    ) {
      throw conflict('Course list changed. Refresh and try again.');
    }
  }

  async listWeeks(courseId: string, userId: string) {
    await this.getCourse(courseId, userId);
    return this.repository.listWeeks(courseId, userId);
  }

  async getWeek(id: string, userId: string) {
    const week = await this.repository.findWeek(id, userId);
    if (!week) throw new NotFoundError('Week not found.');
    return week;
  }

  async createWeek(courseId: string, userId: string, input: WeekInput) {
    await this.getCourse(courseId, userId);
    const now = new Date().toISOString();
    const created = await this.repository.createWeek({
      id: crypto.randomUUID(),
      userId,
      courseId,
      weekNumber: input.weekNumber,
      title: textOrNull(input.title),
      notes: textOrNull(input.notes),
      createdAt: now,
      updatedAt: now,
    });
    if (!created) throw conflict('Week number already exists in this course.');
    return created;
  }

  async updateWeek(id: string, userId: string, input: Changes<WeekInput>) {
    await this.getWeek(id, userId);
    const updated = await this.repository.updateWeek(id, userId, {
      ...(input.weekNumber !== undefined ? { weekNumber: input.weekNumber } : {}),
      ...(input.title !== undefined ? { title: textOrNull(input.title) } : {}),
      ...(input.notes !== undefined ? { notes: textOrNull(input.notes) } : {}),
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      await this.getWeek(id, userId);
      throw conflict('Week number already exists in this course.');
    }
    return updated;
  }

  async deleteWeek(id: string, userId: string) {
    await this.getWeek(id, userId);
    await this.materials.deleteWithin('week', id, userId);
    if (!(await this.repository.deleteWeek(id, userId))) {
      throw conflict('Week contains stored files or inaccessible descendants.');
    }
  }
}
