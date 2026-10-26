import { and, asc, desc, eq, lt, or, sql } from 'drizzle-orm';
import type { Database } from '../client';
import { courses, materials, semesters, weeks } from '../schema';

export type MaterialRecord = typeof materials.$inferSelect;
export type MaterialContext = MaterialRecord & {
  courseId: string;
  courseName: string;
  semesterId: string;
  weekNumber: number;
};
export type MaterialInsert = Omit<typeof materials.$inferInsert, 'position'>;
export interface MaterialCursor {
  updatedAt: string;
  id: string;
}

export class MaterialsRepository {
  constructor(private readonly db: Database) {}

  private query(userId: string) {
    return this.db
      .select({
        material: materials,
        courseId: sql<string>`${courses.id}`.as('context_course_id'),
        courseName: sql<string>`${courses.name}`.as('context_course_name'),
        semesterId: sql<string>`${semesters.id}`.as('context_semester_id'),
        weekNumber: sql<number>`${weeks.weekNumber}`.as('context_week_number'),
      })
      .from(materials)
      .innerJoin(weeks, eq(materials.weekId, weeks.id))
      .innerJoin(courses, eq(weeks.courseId, courses.id))
      .innerJoin(semesters, eq(courses.semesterId, semesters.id))
      .where(
        and(
          eq(materials.userId, userId),
          eq(weeks.userId, userId),
          eq(courses.userId, userId),
          eq(semesters.userId, userId),
        ),
      )
      .$dynamic();
  }

  private scope(userId: string) {
    return and(
      eq(materials.userId, userId),
      eq(weeks.userId, userId),
      eq(courses.userId, userId),
      eq(semesters.userId, userId),
    );
  }

  async find(id: string, userId: string): Promise<MaterialContext | null> {
    const [row] = await this.query(userId)
      .where(and(this.scope(userId), eq(materials.id, id)))
      .limit(1);
    return row
      ? {
          ...row.material,
          courseId: row.courseId,
          courseName: row.courseName,
          semesterId: row.semesterId,
          weekNumber: row.weekNumber,
        }
      : null;
  }

  async listWeek(weekId: string, userId: string, limit: number, offset: number) {
    const rows = await this.query(userId)
      .where(and(this.scope(userId), eq(materials.weekId, weekId)))
      .orderBy(asc(materials.position), asc(materials.id))
      .limit(limit)
      .offset(offset);
    return rows.map((row) => ({
      ...row.material,
      courseId: row.courseId,
      courseName: row.courseName,
      semesterId: row.semesterId,
      weekNumber: row.weekNumber,
    }));
  }

  async listSemester(semesterId: string, userId: string, limit: number, cursor?: MaterialCursor) {
    const rows = await this.query(userId)
      .where(
        and(
          this.scope(userId),
          eq(semesters.id, semesterId),
          cursor
            ? or(
                lt(materials.updatedAt, cursor.updatedAt),
                and(eq(materials.updatedAt, cursor.updatedAt), lt(materials.id, cursor.id)),
              )
            : undefined,
        ),
      )
      .orderBy(desc(materials.updatedAt), desc(materials.id))
      .limit(limit + 1);
    return rows.map((row) => ({
      ...row.material,
      courseId: row.courseId,
      courseName: row.courseName,
      semesterId: row.semesterId,
      weekNumber: row.weekNumber,
    }));
  }

  async create(data: MaterialInsert): Promise<MaterialContext | null> {
    const inserted = await this.db.all<{ id: string }>(sql`
      INSERT INTO materials (id, user_id, week_id, type, title, original_filename, mime_type,
        size_bytes, r2_key, external_url, position, created_at, updated_at, last_opened_at)
      SELECT ${data.id}, ${data.userId}, w.id, ${data.type}, ${data.title},
        ${data.originalFilename ?? null}, ${data.mimeType ?? null}, ${data.sizeBytes ?? null},
        ${data.r2Key ?? null}, ${data.externalUrl ?? null},
        (SELECT COALESCE(MAX(position), -1) + 1 FROM materials WHERE week_id = w.id AND user_id = ${data.userId}),
        ${data.createdAt}, ${data.updatedAt}, NULL
      FROM weeks w JOIN courses c ON c.id = w.course_id JOIN semesters s ON s.id = c.semester_id
      WHERE w.id = ${data.weekId} AND w.user_id = ${data.userId}
        AND c.user_id = ${data.userId} AND s.user_id = ${data.userId}
      RETURNING id
    `);
    return inserted[0] ? this.find(inserted[0].id, data.userId) : null;
  }

  async update(
    id: string,
    userId: string,
    data: {
      title?: string | undefined;
      externalUrl?: string | undefined;
      weekId?: string | undefined;
      updatedAt: string;
    },
  ) {
    const { weekId, ...changes } = data;
    const [row] = await this.db
      .update(materials)
      .set({
        ...changes,
        ...(weekId
          ? {
              weekId,
              position: sql`CASE WHEN week_id = ${weekId} THEN position ELSE
        (SELECT COALESCE(MAX(other.position), -1) + 1 FROM materials other
        WHERE other.week_id = ${weekId} AND other.user_id = ${userId}) END`,
            }
          : {}),
      })
      .where(
        and(
          eq(materials.id, id),
          eq(materials.userId, userId),
          this.parentOwned(userId),
          weekId
            ? sql`EXISTS (SELECT 1 FROM weeks w JOIN courses c ON c.id = w.course_id
        JOIN semesters s ON s.id = c.semester_id WHERE w.id = ${weekId}
        AND w.user_id = ${userId} AND c.user_id = ${userId} AND s.user_id = ${userId})`
            : undefined,
          data.externalUrl !== undefined ? eq(materials.type, 'link') : undefined,
        ),
      )
      .returning({ id: materials.id });
    return row ? this.find(row.id, userId) : null;
  }

  private parentOwned(userId: string) {
    return sql`EXISTS (SELECT 1 FROM weeks w JOIN courses c ON c.id = w.course_id
      JOIN semesters s ON s.id = c.semester_id WHERE w.id = materials.week_id
      AND w.user_id = ${userId} AND c.user_id = ${userId} AND s.user_id = ${userId})`;
  }

  async deleteMetadata(id: string, userId: string) {
    // Package 4.4 must coordinate R2 cleanup before exposing this operation through HTTP.
    const rows = await this.db
      .delete(materials)
      .where(and(eq(materials.id, id), eq(materials.userId, userId), this.parentOwned(userId)))
      .returning({ id: materials.id });
    return rows.length > 0;
  }

  async hasStoredReference(id: string, userId: string, key: string) {
    const [row] = await this.db
      .select({ id: materials.id })
      .from(materials)
      .where(and(eq(materials.id, id), eq(materials.userId, userId), eq(materials.r2Key, key)))
      .limit(1);
    return Boolean(row);
  }
}
