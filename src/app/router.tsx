import { createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';

export { routes };

export const router =
  typeof window !== 'undefined'
    ? createBrowserRouter(routes)
    : (null as unknown as ReturnType<typeof createBrowserRouter>);
