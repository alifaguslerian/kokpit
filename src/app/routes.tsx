import { Navigate, type RouteObject } from 'react-router-dom';
import { AppShell } from './AppShell';
import { HomeRoute } from './routes/HomeRoute';
import { CollegeRoute } from './routes/CollegeRoute';
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
        element: <CollegeRoute />,
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
