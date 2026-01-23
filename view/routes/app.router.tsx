import { App } from '@/components/app/app';
import { ErrorPage } from '@/pages/error-page';
import { HomePage } from '@/pages/home-page';
import { PageNotFound } from '@/pages/page-not-found';
import { authRouter } from '@/routes/auth.router';
import { instanceSettingsRouter } from '@/routes/instance-settings.router';
import { invitesRouter } from '@/routes/invites.router';
import { serversRouter } from '@/routes/servers.router';
import { usersRouter } from '@/routes/users.router';
import { createBrowserRouter } from 'react-router-dom';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '*',
        element: <PageNotFound />,
      },
      authRouter,
      instanceSettingsRouter,
      invitesRouter,
      serversRouter,
      usersRouter,
    ],
  },
]);
