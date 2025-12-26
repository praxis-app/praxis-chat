import { App } from '@/components/app/app';
import { ErrorPage } from '@/pages/error-page';
import { HomePage } from '@/pages/home-page';
import { InviteCheck } from '@/pages/invites/invite-check';
import { PageNotFound } from '@/pages/page-not-found';
import { createBrowserRouter } from 'react-router-dom';
import { authRouter } from './auth.router';
import { instanceSettingsRouter } from './instance-settings.router';
import { serversRouter } from './servers.router';
import { usersRouter } from './users.router';

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
      {
        path: 'i/:token',
        element: <InviteCheck />,
      },
      authRouter,
      usersRouter,
      serversRouter,
      instanceSettingsRouter,
    ],
  },
]);
