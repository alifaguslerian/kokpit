import { Hono } from 'hono';
import type { WorkerEnv } from './env';
import { systemRoutes } from './api/system.routes';
import { ideasRoutes } from './api/ideas.routes';
import { ideaCollectionsRoutes } from './api/idea-collections.routes';
import { quickLinksRoutes } from './api/quick-links.routes';
import { collegeRoutes } from './api/college.routes';
import { materialsRoutes, fileRoutes } from './api/materials.routes';
import { scheduleRoutes } from './api/schedule.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { ownerContext } from './middleware/owner-context';

const app = new Hono<WorkerEnv>();

app.onError(errorHandler);
app.notFound(notFoundHandler);

app.use('/api/*', ownerContext);

app.route('/api/system', systemRoutes);
app.route('/api/ideas', ideasRoutes);
app.route('/api/idea-collections', ideaCollectionsRoutes);
app.route('/api/quick-links', quickLinksRoutes);
app.route('/api/college', collegeRoutes);
app.route('/api/college', materialsRoutes);
app.route('/api/college', scheduleRoutes);
app.route('/api/files', fileRoutes);

export default app;
