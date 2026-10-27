import { Hono, type Context } from 'hono';
import { z } from 'zod';
import type { WorkerEnv } from '../env';
import { createDb } from '../db/client';
import { CollegeRepository } from '../db/repositories/college.repository';
import { CollegeService } from '../services/college.service';
import { MaterialsService } from '../services/materials.service';
import { MaterialsRepository } from '../db/repositories/materials.repository';
import { validateJson, validateParams, validateQuery } from '../utils/validator';

const id = z.string().min(1).max(128);
const idParams = z.object({ id });
const semesterParams = z.object({ semesterId: id });
const courseParams = z.object({ courseId: id });
const emptyQuery = z.object({}).strict();
const name = z.string().trim().min(1).max(200);
const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();
const positiveInteger = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const semesterFields = {
  name,
  academicYear: optionalText(50),
  termNumber: positiveInteger.nullable().optional(),
  isActive: z.boolean().optional(),
};
const courseFields = {
  name,
  code: optionalText(50),
  lecturer: optionalText(200),
  description: optionalText(2000),
  accentKey: optionalText(64),
};
const weekFields = {
  weekNumber: positiveInteger,
  title: optionalText(200),
  notes: optionalText(2000),
};
const semesterCreate = z.object(semesterFields).strict();
const courseCreate = z.object(courseFields).strict();
const weekCreate = z.object(weekFields).strict();
const hasChanges = (body: object) => Object.keys(body).length > 0;
const semesterUpdate = semesterCreate
  .partial()
  .refine(hasChanges, 'Provide at least one field to update.');
const courseUpdate = courseCreate
  .partial()
  .refine(hasChanges, 'Provide at least one field to update.');
const weekUpdate = weekCreate.partial().refine(hasChanges, 'Provide at least one field to update.');
const reorder = z.object({ ids: z.array(id) }).strict();

const service = (c: Context<WorkerEnv>) => {
  const db = createDb(c.env.DB);
  const repository = new CollegeRepository(db);
  return new CollegeService(
    repository,
    new MaterialsService(new MaterialsRepository(db), repository, c.env.R2),
  );
};
const body = <T>(c: Context<WorkerEnv>) => c.get('validatedJson' as never) as T;

export const collegeRoutes = new Hono<WorkerEnv>();

collegeRoutes.get('/semesters', validateQuery(emptyQuery), async (c) =>
  c.json({ data: await service(c).listSemesters(c.get('userId')) }),
);

collegeRoutes.post('/semesters', validateJson(semesterCreate), async (c) =>
  c.json(
    {
      data: await service(c).createSemester(
        c.get('userId'),
        body<z.infer<typeof semesterCreate>>(c),
      ),
    },
    201,
  ),
);

collegeRoutes.post('/semesters/reorder', validateJson(reorder), async (c) => {
  await service(c).reorderSemesters(c.get('userId'), body<z.infer<typeof reorder>>(c).ids);
  return c.json({ success: true });
});

collegeRoutes.get('/semesters/:id', validateParams(idParams), async (c) =>
  c.json({ data: await service(c).getSemester(c.req.param('id'), c.get('userId')) }),
);

collegeRoutes.patch(
  '/semesters/:id',
  validateParams(idParams),
  validateJson(semesterUpdate),
  async (c) =>
    c.json({
      data: await service(c).updateSemester(
        c.req.param('id'),
        c.get('userId'),
        body<z.infer<typeof semesterUpdate>>(c),
      ),
    }),
);

collegeRoutes.delete('/semesters/:id', validateParams(idParams), async (c) => {
  await service(c).deleteSemester(c.req.param('id'), c.get('userId'));
  return c.json({ success: true, id: c.req.param('id') });
});

collegeRoutes.get(
  '/semesters/:semesterId/courses',
  validateParams(semesterParams),
  validateQuery(emptyQuery),
  async (c) =>
    c.json({ data: await service(c).listCourses(c.req.param('semesterId'), c.get('userId')) }),
);

collegeRoutes.post(
  '/semesters/:semesterId/courses',
  validateParams(semesterParams),
  validateJson(courseCreate),
  async (c) =>
    c.json(
      {
        data: await service(c).createCourse(
          c.req.param('semesterId'),
          c.get('userId'),
          body<z.infer<typeof courseCreate>>(c),
        ),
      },
      201,
    ),
);

collegeRoutes.post(
  '/semesters/:semesterId/courses/reorder',
  validateParams(semesterParams),
  validateJson(reorder),
  async (c) => {
    await service(c).reorderCourses(
      c.req.param('semesterId'),
      c.get('userId'),
      body<z.infer<typeof reorder>>(c).ids,
    );
    return c.json({ success: true });
  },
);

collegeRoutes.get('/courses/:id', validateParams(idParams), async (c) =>
  c.json({ data: await service(c).getCourse(c.req.param('id'), c.get('userId')) }),
);

collegeRoutes.patch(
  '/courses/:id',
  validateParams(idParams),
  validateJson(courseUpdate),
  async (c) =>
    c.json({
      data: await service(c).updateCourse(
        c.req.param('id'),
        c.get('userId'),
        body<z.infer<typeof courseUpdate>>(c),
      ),
    }),
);

collegeRoutes.delete('/courses/:id', validateParams(idParams), async (c) => {
  await service(c).deleteCourse(c.req.param('id'), c.get('userId'));
  return c.json({ success: true, id: c.req.param('id') });
});

collegeRoutes.get(
  '/courses/:courseId/weeks',
  validateParams(courseParams),
  validateQuery(emptyQuery),
  async (c) =>
    c.json({ data: await service(c).listWeeks(c.req.param('courseId'), c.get('userId')) }),
);

collegeRoutes.post(
  '/courses/:courseId/weeks',
  validateParams(courseParams),
  validateJson(weekCreate),
  async (c) =>
    c.json(
      {
        data: await service(c).createWeek(
          c.req.param('courseId'),
          c.get('userId'),
          body<z.infer<typeof weekCreate>>(c),
        ),
      },
      201,
    ),
);

collegeRoutes.get('/weeks/:id', validateParams(idParams), async (c) =>
  c.json({ data: await service(c).getWeek(c.req.param('id'), c.get('userId')) }),
);

collegeRoutes.patch('/weeks/:id', validateParams(idParams), validateJson(weekUpdate), async (c) =>
  c.json({
    data: await service(c).updateWeek(
      c.req.param('id'),
      c.get('userId'),
      body<z.infer<typeof weekUpdate>>(c),
    ),
  }),
);

collegeRoutes.delete('/weeks/:id', validateParams(idParams), async (c) => {
  await service(c).deleteWeek(c.req.param('id'), c.get('userId'));
  return c.json({ success: true, id: c.req.param('id') });
});
