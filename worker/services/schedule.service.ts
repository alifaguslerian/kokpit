import type { CollegeRepository } from '../db/repositories/college.repository';
import type { ScheduleRepository } from '../db/repositories/schedule.repository';
import { AppError, BadRequestError, NotFoundError } from '../utils/errors';
import { scheduleWeek } from '../utils/schedule-week';

export interface ScheduleInput {
  weekday: number;
  startMinute: number;
  endMinute: number;
  room?: string | null | undefined;
}
export type ScheduleChanges = {
  [Field in keyof ScheduleInput]?: ScheduleInput[Field] | undefined;
} & { courseId?: string | undefined };
const duplicate = () =>
  new AppError('CONFLICT', 'This course already has a class with the same day and times.', 409);
export class ScheduleService {
  constructor(
    private readonly repository: ScheduleRepository,
    private readonly college: CollegeRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}
  async list(semesterId: string, userId: string) {
    if (!(await this.college.findSemester(semesterId, userId)))
      throw new NotFoundError('Semester not found.');
    const timezone = await this.repository.timezone(userId);
    let week;
    try {
      week = scheduleWeek(this.now(), timezone);
    } catch {
      console.error('[College schedule]', { code: 'SCHEDULE_TIMEZONE_UNAVAILABLE' });
      throw new AppError(
        'SCHEDULE_TIMEZONE_UNAVAILABLE',
        'The saved timezone is unavailable. Other College content is still accessible.',
        503,
      );
    }
    return { data: await this.repository.list(semesterId, userId), timezone, week };
  }
  private interval(start: number, end: number) {
    if (start >= end)
      throw new BadRequestError('End time must follow start time within the same day.');
  }
  async create(courseId: string, userId: string, input: ScheduleInput) {
    if (!(await this.college.findCourse(courseId, userId)))
      throw new NotFoundError('Course not found.');
    this.interval(input.startMinute, input.endMinute);
    const now = this.now().toISOString();
    const row = await this.repository.create({
      ...input,
      room: input.room?.trim() || null,
      id: crypto.randomUUID(),
      userId,
      courseId,
      createdAt: now,
      updatedAt: now,
    });
    if (!row) {
      if (!(await this.college.findCourse(courseId, userId)))
        throw new NotFoundError('Course not found.');
      throw duplicate();
    }
    return row;
  }
  async update(id: string, userId: string, input: ScheduleChanges) {
    const current = await this.repository.find(id, userId);
    if (!current) throw new NotFoundError('Class not found.');
    const courseId = input.courseId ?? current.courseId;
    const course = await this.college.findCourse(courseId, userId);
    if (!course || course.semesterId !== current.semesterId)
      throw new NotFoundError('Course not found in this semester.');
    const data = {
      courseId,
      weekday: input.weekday ?? current.weekday,
      startMinute: input.startMinute ?? current.startMinute,
      endMinute: input.endMinute ?? current.endMinute,
      room: input.room === undefined ? current.room : input.room?.trim() || null,
      updatedAt: this.now().toISOString(),
    };
    this.interval(data.startMinute, data.endMinute);
    const row = await this.repository.update(id, userId, current.semesterId, data);
    if (!row) {
      if (!(await this.repository.find(id, userId))) throw new NotFoundError('Class not found.');
      if (!(await this.college.findCourse(courseId, userId)))
        throw new NotFoundError('Course not found.');
      throw duplicate();
    }
    return row;
  }
  async delete(id: string, userId: string) {
    if (!(await this.repository.delete(id, userId))) throw new NotFoundError('Class not found.');
  }
}
