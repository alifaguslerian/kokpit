import { Hono } from 'hono';
import { systemRoutes } from './api/system.routes';

const app = new Hono();

app.route('/api/system', systemRoutes);

app.notFound((context) =>
  context.json({ error: { code: 'NOT_FOUND', message: 'Not found.' } }, 404),
);

export default app;
