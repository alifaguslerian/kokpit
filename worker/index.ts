import { Hono } from 'hono';
import type { WorkerEnv } from './env';
import { systemRoutes } from './api/system.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { ownerContext } from './middleware/owner-context';

const app = new Hono<WorkerEnv>();

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.use('/api/*', ownerContext);

app.route('/api/system', systemRoutes);

export default app;
