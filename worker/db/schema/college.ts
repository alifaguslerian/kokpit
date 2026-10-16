import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const semesters = sqliteTable(
  'semesters',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    academicYear: text('academic_year'),
    termNumber: integer('term_number'),
    isActive: integer('is_active').notNull().default(0),
    position: integer('position').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('semesters_user_position_idx').on(table.userId, table.position),
    index('semesters_user_active_idx').on(table.userId, table.isActive),
  ],
);

export const courses = sqliteTable(
  'courses',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    semesterId: text('semester_id')
      .notNull()
      .references(() => semesters.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    code: text('code'),
    lecturer: text('lecturer'),
    accentKey: text('accent_key'),
    position: integer('position').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('courses_semester_position_idx').on(table.semesterId, table.position),
    index('courses_user_semester_idx').on(table.userId, table.semesterId),
  ],
);

export const weeks = sqliteTable(
  'weeks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, { onDelete: 'cascade' }),
    weekNumber: integer('week_number').notNull(),
    title: text('title'),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('weeks_course_week_number_unique').on(table.courseId, table.weekNumber),
    index('weeks_course_number_idx').on(table.courseId, table.weekNumber),
    index('weeks_user_course_idx').on(table.userId, table.courseId),
  ],
);

export const materials = sqliteTable(
  'materials',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    weekId: text('week_id')
      .notNull()
      .references(() => weeks.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    originalFilename: text('original_filename'),
    mimeType: text('mime_type'),
    sizeBytes: integer('size_bytes'),
    r2Key: text('r2_key'),
    externalUrl: text('external_url'),
    position: integer('position').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    lastOpenedAt: text('last_opened_at'),
  },
  (table) => [
    index('materials_week_position_idx').on(table.weekId, table.position),
    index('materials_user_week_idx').on(table.userId, table.weekId),
    index('materials_last_opened_idx').on(table.userId, table.lastOpenedAt),
  ],
);
