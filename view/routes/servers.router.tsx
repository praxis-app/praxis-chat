import { HomePage } from '@/pages/home-page';
import { channelsRouter } from '@/routes/channels.router';
import { serverSettingsRouter } from '@/routes/server-settings.router';
import { RouteObject } from 'react-router-dom';

export const serversRouter: RouteObject = {
  path: 's/:serverSlug',
  children: [
    {
      index: true,
      element: <HomePage />,
    },
    serverSettingsRouter,
    channelsRouter,
  ],
};
