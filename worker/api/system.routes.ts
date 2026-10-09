import { Hono } from 'hono';

export const systemRoutes = new Hono();

systemRoutes.get('/health', (context) => context.json({ status: 'ok' }));
