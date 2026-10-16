import { Hono } from 'hono';
import type { WorkerEnv } from '../env';

export const systemRoutes = new Hono<WorkerEnv>();

systemRoutes.get('/health', (context) => context.json({ status: 'ok' }));
