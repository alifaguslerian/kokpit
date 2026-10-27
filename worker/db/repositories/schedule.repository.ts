import { and, asc, eq, sql } from 'drizzle-orm';
import type { Database } from '../client';
import { courseScheduleEntries as entries, courses, semesters, userSettings } from '../schema';

export type ScheduleRecord = typeof entries.$inferSelect;
export type ScheduleContext = ScheduleRecord & {
  courseName: string;
  courseCode: string | null;
  semesterId: string;
};
export class ScheduleRepository {
  constructor(private readonly db: Database) {}
  private scope(userId: string) {
    return and(
      eq(entries.userId, userId),
      eq(courses.userId, userId),
      eq(semesters.userId, userId),
    );
  }
  private query() {
    return this.db
      .select({
        entry: entries,
        courseName: sql<string>`${courses.name}`.as('schedule_course_name'),
        courseCode: sql<string | null>`${courses.code}`.as('schedule_course_code'),
        semesterId: sql<string>`${semesters.id}`.as('schedule_semester_id'),
      })
      .from(entries)
      .innerJoin(courses, eq(entries.courseId, courses.id))
      .innerJoin(semesters, eq(courses.semesterId, semesters.id))
      .$dynamic();
  }
  async list(semesterId: string, userId: string): Promise<ScheduleContext[]> {
    const rows = await this.query()
      .where(and(this.scope(userId), eq(semesters.id, semesterId)))
      .orderBy(asc(entries.weekday), asc(entries.startMinute), asc(entries.id));
    return rows.map(({ entry, ...context }) => ({ ...entry, ...context }));
  }
  async find(id: string, userId: string): Promise<ScheduleContext | null> {
    const [row] = await this.query()
      .where(and(this.scope(userId), eq(entries.id, id)))
      .limit(1);
    return row
      ? {
          ...row.entry,
          courseName: row.courseName,
          courseCode: row.courseCode,
          semesterId: row.semesterId,
        }
      : null;
  }
  async timezone(userId: string) {
    const [row] = await this.db
      .select({ timezone: userSettings.timezone })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    return row?.timezone ?? 'Asia/Jakarta';
  }
  async create(data: ScheduleRecord) {
    const rows = await this.db.all<{ id: string }>(sql`
      INSERT INTO course_schedule_entries (id, user_id, course_id, weekday, start_minute, end_minute, room, created_at, updated_at)
      SELECT ${data.id}, ${data.userId}, c.id, ${data.weekday}, ${data.startMinute}, ${data.endMinute}, ${data.room}, ${data.createdAt}, ${data.updatedAt}
      FROM courses c JOIN semesters s ON s.id = c.semester_id WHERE c.id = ${data.courseId}
        AND c.user_id = ${data.userId} AND s.user_id = ${data.userId}
      ON CONFLICT (course_id, weekday, start_minute, end_minute) DO NOTHING RETURNING id
    `);
    return rows[0] ? this.find(rows[0].id, data.userId) : null;
  }
  private parentOwned(userId: string) {
    return sql`EXISTS (SELECT 1 FROM courses c JOIN semesters s ON s.id = c.semester_id
      WHERE c.id = course_schedule_entries.course_id AND c.user_id = ${userId} AND s.user_id = ${userId})`;
  }
  async update(
    id: string,
    userId: string,
    semesterId: string,
    data: Pick<
      ScheduleRecord,
      'courseId' | 'weekday' | 'startMinute' | 'endMinute' | 'room' | 'updatedAt'
    >,
  ) {
    const rows = await this.db
      .update(entries)
      .set(data)
      .where(
        and(
          eq(entries.id, id),
          eq(entries.userId, userId),
          this.parentOwned(userId),
          sql`EXISTS (SELECT 1 FROM courses c JOIN semesters s ON s.id = c.semester_id WHERE c.id = ${data.courseId}
        AND c.user_id = ${userId} AND s.user_id = ${userId} AND s.id = ${semesterId})`,
          sql`NOT EXISTS (SELECT 1 FROM course_schedule_entries other WHERE other.id <> ${id}
        AND other.course_id = ${data.courseId} AND other.weekday = ${data.weekday}
        AND other.start_minute = ${data.startMinute} AND other.end_minute = ${data.endMinute})`,
        ),
      )
      .returning({ id: entries.id });
    return rows[0] ? this.find(id, userId) : null;
  }
  async delete(id: string, userId: string) {
    return (
      (
        await this.db
          .delete(entries)
          .where(and(eq(entries.id, id), eq(entries.userId, userId), this.parentOwned(userId)))
          .returning({ id: entries.id })
      ).length > 0
    );
  }
}
