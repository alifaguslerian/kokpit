import { Hono } from 'hono';
import type { WorkerEnv } from './env';
import { systemRoutes } from './api/system.routes';
import { ideasRoutes } from './api/ideas.routes';
import { quickLinksRoutes } from './api/quick-links.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { ownerContext } from './middleware/owner-context';

const app = new Hono<WorkerEnv>();

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.use('/api/*', ownerContext);

app.route('/api/system', systemRoutes);
app.route('/api/ideas', ideasRoutes);
app.route('/api/quick-links', quickLinksRoutes);

export default app;
