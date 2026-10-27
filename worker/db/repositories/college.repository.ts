import { and, asc, eq, ne, sql, type SQL } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
import type { Database } from '../client';
import { courses, semesters, weeks } from '../schema';
import { BadRequestError } from '../../utils/errors';

export type SemesterRecord = Omit<typeof semesters.$inferSelect, 'isActive'> & {
  isActive: boolean;
};
export type CourseRecord = typeof courses.$inferSelect;
export type WeekRecord = typeof weeks.$inferSelect;
type SemesterInsert = Omit<typeof semesters.$inferInsert, 'position'>;
type SemesterChanges = Partial<
  Pick<SemesterInsert, 'name' | 'academicYear' | 'termNumber' | 'isActive'>
> & { updatedAt: string };
type CourseInsert = Omit<typeof courses.$inferInsert, 'position'>;
type CourseChanges = Partial<
  Pick<CourseInsert, 'name' | 'code' | 'lecturer' | 'description' | 'accentKey'>
> & {
  updatedAt: string;
};
type WeekChanges = Partial<Pick<typeof weeks.$inferInsert, 'weekNumber' | 'title' | 'notes'>> & {
  updatedAt: string;
};

function semesterRecord(row: typeof semesters.$inferSelect): SemesterRecord {
  return { ...row, isActive: Boolean(row.isActive) };
}

export class CollegeRepository {
  constructor(private readonly db: Database) {}

  async hasInaccessibleDescendants(
    kind: 'semester' | 'course' | 'week',
    id: string,
    userId: string,
  ) {
    if (kind !== 'week') {
      const parentScope = kind === 'semester' ? sql`c.semester_id = ${id}` : sql`c.id = ${id}`;
      const foreignClasses = await this.db.all(sql`SELECT e.id FROM course_schedule_entries e
        JOIN courses c ON c.id = e.course_id WHERE ${parentScope} AND e.user_id <> ${userId} LIMIT 1`);
      if (foreignClasses.length) return true;
    }
    const query =
      kind === 'semester'
        ? sql`SELECT c.id FROM courses c LEFT JOIN weeks w ON w.course_id = c.id
          LEFT JOIN materials m ON m.week_id = w.id WHERE c.semester_id = ${id}
          AND (c.user_id <> ${userId} OR w.user_id <> ${userId} OR m.user_id <> ${userId}) LIMIT 1`
        : kind === 'course'
          ? sql`SELECT w.id FROM weeks w LEFT JOIN materials m ON m.week_id = w.id
            WHERE w.course_id = ${id} AND (w.user_id <> ${userId} OR m.user_id <> ${userId}) LIMIT 1`
          : sql`SELECT id FROM materials WHERE week_id = ${id} AND user_id <> ${userId} LIMIT 1`;
    return (await this.db.all(query)).length > 0;
  }

  async listSemesters(userId: string): Promise<SemesterRecord[]> {
    return (
      await this.db
        .select()
        .from(semesters)
        .where(eq(semesters.userId, userId))
        .orderBy(asc(semesters.position), asc(semesters.id))
    ).map(semesterRecord);
  }

  async findSemester(id: string, userId: string): Promise<SemesterRecord | null> {
    const [row] = await this.db
      .select()
      .from(semesters)
      .where(and(eq(semesters.id, id), eq(semesters.userId, userId)))
      .limit(1);
    return row ? semesterRecord(row) : null;
  }

  async createSemester(data: SemesterInsert): Promise<SemesterRecord> {
    const insert = this.db
      .insert(semesters)
      .values({
        ...data,
        position: sql`(SELECT COALESCE(MAX(position), -1) + 1 FROM semesters WHERE user_id = ${data.userId})`,
      })
      .returning();
    const statements: [typeof insert, ...BatchItem<'sqlite'>[]] = [insert];
    if (data.isActive)
      statements.push(this.deactivateOtherSemesters(data.id, data.userId, data.updatedAt));
    const [created] = await this.db.batch(statements);
    return semesterRecord(created[0]!);
  }

  async updateSemester(
    id: string,
    userId: string,
    data: SemesterChanges,
  ): Promise<SemesterRecord | null> {
    const update = this.db
      .update(semesters)
      .set(data)
      .where(and(eq(semesters.id, id), eq(semesters.userId, userId)))
      .returning();
    const statements: [typeof update, ...BatchItem<'sqlite'>[]] = [update];
    if (data.isActive) statements.push(this.deactivateOtherSemesters(id, userId, data.updatedAt));
    const [updated] = await this.db.batch(statements);
    return updated[0] ? semesterRecord(updated[0]) : null;
  }

  private deactivateOtherSemesters(id: string, userId: string, updatedAt: string) {
    return this.db
      .update(semesters)
      .set({ isActive: 0, updatedAt })
      .where(
        and(
          eq(semesters.userId, userId),
          ne(semesters.id, id),
          eq(semesters.isActive, 1),
          sql`EXISTS (SELECT 1 FROM semesters target WHERE target.id = ${id} AND target.user_id = ${userId} AND target.is_active = 1)`,
        ),
      );
  }

  async deleteSemester(id: string, userId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(semesters)
      .where(
        and(
          eq(semesters.id, id),
          eq(semesters.userId, userId),
          sql`NOT EXISTS (SELECT 1 FROM course_schedule_entries e JOIN courses c ON c.id = e.course_id
            WHERE c.semester_id = ${id} AND e.user_id <> ${userId})`,
          sql`NOT EXISTS (
        SELECT 1 FROM courses c LEFT JOIN weeks w ON w.course_id = c.id
        LEFT JOIN materials m ON m.week_id = w.id
        WHERE c.semester_id = ${id} AND (
          c.user_id <> ${userId} OR w.user_id <> ${userId} OR m.user_id <> ${userId}
          OR m.type = 'file' OR m.r2_key IS NOT NULL
        )
      )`,
        ),
      )
      .returning({ id: semesters.id });
    return deleted.length > 0;
  }

  async listCourses(semesterId: string, userId: string): Promise<CourseRecord[]> {
    const rows = await this.db
      .select({ course: courses })
      .from(courses)
      .innerJoin(semesters, eq(courses.semesterId, semesters.id))
      .where(
        and(
          eq(courses.semesterId, semesterId),
          eq(courses.userId, userId),
          eq(semesters.userId, userId),
        ),
      )
      .orderBy(asc(courses.position), asc(courses.id));
    return rows.map((row) => row.course);
  }

  async findCourse(id: string, userId: string): Promise<CourseRecord | null> {
    const [row] = await this.db
      .select({ course: courses })
      .from(courses)
      .innerJoin(semesters, eq(courses.semesterId, semesters.id))
      .where(and(eq(courses.id, id), eq(courses.userId, userId), eq(semesters.userId, userId)))
      .limit(1);
    return row?.course ?? null;
  }

  async createCourse(data: CourseInsert): Promise<CourseRecord> {
    const [created] = await this.db
      .insert(courses)
      .values({
        ...data,
        position: sql`(SELECT COALESCE(MAX(position), -1) + 1 FROM courses WHERE user_id = ${data.userId} AND semester_id = ${data.semesterId})`,
      })
      .returning();
    return created!;
  }

  async updateCourse(
    id: string,
    userId: string,
    data: CourseChanges,
  ): Promise<CourseRecord | null> {
    const [updated] = await this.db
      .update(courses)
      .set(data)
      .where(and(eq(courses.id, id), eq(courses.userId, userId), this.courseParentOwned(userId)))
      .returning();
    return updated ?? null;
  }

  async deleteCourse(id: string, userId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(courses)
      .where(
        and(
          eq(courses.id, id),
          eq(courses.userId, userId),
          sql`NOT EXISTS (SELECT 1 FROM course_schedule_entries e WHERE e.course_id = ${id} AND e.user_id <> ${userId})`,
          this.courseParentOwned(userId),
          sql`NOT EXISTS (
        SELECT 1 FROM weeks w LEFT JOIN materials m ON m.week_id = w.id
        WHERE w.course_id = ${id} AND (w.user_id <> ${userId} OR m.user_id <> ${userId}
          OR m.type = 'file' OR m.r2_key IS NOT NULL)
      )`,
        ),
      )
      .returning({ id: courses.id });
    return deleted.length > 0;
  }

  private courseParentOwned(userId: string): SQL {
    return sql`EXISTS (SELECT 1 FROM semesters s WHERE s.id = courses.semester_id AND s.user_id = ${userId})`;
  }

  async listWeeks(courseId: string, userId: string): Promise<WeekRecord[]> {
    const rows = await this.db
      .select({ week: weeks })
      .from(weeks)
      .innerJoin(courses, eq(weeks.courseId, courses.id))
      .innerJoin(semesters, eq(courses.semesterId, semesters.id))
      .where(
        and(
          eq(weeks.courseId, courseId),
          eq(weeks.userId, userId),
          eq(courses.userId, userId),
          eq(semesters.userId, userId),
        ),
      )
      .orderBy(asc(weeks.weekNumber), asc(weeks.id));
    return rows.map((row) => row.week);
  }

  async findWeek(id: string, userId: string): Promise<WeekRecord | null> {
    const [row] = await this.db
      .select({ week: weeks })
      .from(weeks)
      .innerJoin(courses, eq(weeks.courseId, courses.id))
      .innerJoin(semesters, eq(courses.semesterId, semesters.id))
      .where(
        and(
          eq(weeks.id, id),
          eq(weeks.userId, userId),
          eq(courses.userId, userId),
          eq(semesters.userId, userId),
        ),
      )
      .limit(1);
    return row?.week ?? null;
  }

  async createWeek(data: typeof weeks.$inferInsert): Promise<WeekRecord | null> {
    const [created] = await this.db
      .insert(weeks)
      .values(data)
      .onConflictDoNothing({ target: [weeks.courseId, weeks.weekNumber] })
      .returning();
    return created ?? null;
  }

  async updateWeek(id: string, userId: string, data: WeekChanges): Promise<WeekRecord | null> {
    const [updated] = await this.db
      .update(weeks)
      .set(data)
      .where(
        and(
          eq(weeks.id, id),
          eq(weeks.userId, userId),
          this.weekParentsOwned(userId),
          data.weekNumber === undefined
            ? undefined
            : sql`NOT EXISTS (
        SELECT 1 FROM weeks other WHERE other.course_id = weeks.course_id
        AND other.week_number = ${data.weekNumber} AND other.id <> ${id}
      )`,
        ),
      )
      .returning();
    return updated ?? null;
  }

  async deleteWeek(id: string, userId: string): Promise<boolean> {
    const deleted = await this.db
      .delete(weeks)
      .where(
        and(
          eq(weeks.id, id),
          eq(weeks.userId, userId),
          this.weekParentsOwned(userId),
          sql`NOT EXISTS (SELECT 1 FROM materials m WHERE m.week_id = ${id}
        AND (m.user_id <> ${userId} OR m.type = 'file' OR m.r2_key IS NOT NULL))`,
        ),
      )
      .returning({ id: weeks.id });
    return deleted.length > 0;
  }

  private weekParentsOwned(userId: string): SQL {
    return sql`EXISTS (SELECT 1 FROM courses c JOIN semesters s ON s.id = c.semester_id
      WHERE c.id = weeks.course_id AND c.user_id = ${userId} AND s.user_id = ${userId})`;
  }

  async reorderSemesters(userId: string, ids: string[], updatedAt: string): Promise<boolean> {
    return this.reorder(
      'semesters',
      sql`user_id = ${userId}`,
      (await this.listSemesters(userId)).map((row) => row.id),
      ids,
      updatedAt,
    );
  }

  async reorderCourses(
    semesterId: string,
    userId: string,
    ids: string[],
    updatedAt: string,
  ): Promise<boolean> {
    return this.reorder(
      'courses',
      sql`user_id = ${userId} AND semester_id = ${semesterId} AND ${this.courseParentOwned(userId)}`,
      (await this.listCourses(semesterId, userId)).map((row) => row.id),
      ids,
      updatedAt,
    );
  }

  private async reorder(
    tableName: 'semesters' | 'courses',
    scope: SQL,
    current: string[],
    ids: string[],
    updatedAt: string,
  ): Promise<boolean> {
    if (
      current.length !== ids.length ||
      new Set(ids).size !== ids.length ||
      ids.some((id) => !current.includes(id))
    ) {
      throw new BadRequestError('Provide every current resource ID exactly once.');
    }
    if (ids.length === 0) return true;
    const table = sql.identifier(tableName);
    const order = JSON.stringify(ids);
    // One JSON binding avoids D1's parameter limit; the guarded statement is atomic.
    const updated = await this.db.all<{ id: string }>(sql`
      UPDATE ${table} SET position = (
        SELECT CAST(key AS INTEGER) FROM json_each(${order}) requested WHERE requested.value = ${table}.id
      ), updated_at = ${updatedAt}
      WHERE ${scope}
        AND (SELECT COUNT(*) FROM ${table} WHERE ${scope}) = ${ids.length}
        AND NOT EXISTS (SELECT 1 FROM ${table} WHERE ${scope}
          AND id NOT IN (SELECT value FROM json_each(${order})))
      RETURNING id
    `);
    return updated.length === ids.length;
  }
}
