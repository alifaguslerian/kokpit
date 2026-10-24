import { Navigate, type RouteObject } from 'react-router-dom';
import { AppShell } from './AppShell';
import { HomeRoute } from './routes/HomeRoute';
import { MusicRoute } from './routes/MusicRoute';
import { NewsRoute } from './routes/NewsRoute';
import { IdeasRoute } from './routes/IdeasRoute';
import { LibraryRoute } from './routes/LibraryRoute';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: <HomeRoute />,
      },
      {
        path: 'college',
        lazy: async () => ({ Component: (await import('./routes/CollegeRoute')).CollegeRoute }),
      },
      {
        path: 'college/courses/:courseId',
        lazy: async () => ({
          Component: (await import('@/features/college/pages/CoursePage')).CoursePage,
        }),
      },
      {
        path: 'college/weeks/:weekId',
        lazy: async () => ({
          Component: (await import('@/features/college/pages/WeekPage')).WeekPage,
        }),
      },
      {
        path: 'music',
        element: <MusicRoute />,
      },
      {
        path: 'news',
        element: <NewsRoute />,
      },
      {
        path: 'ideas',
        element: <IdeasRoute />,
      },
      {
        path: 'library',
        element: <LibraryRoute />,
      },
      {
        path: '*',
        element: <Navigate to="/home" replace />,
      },
    ],
  },
];
