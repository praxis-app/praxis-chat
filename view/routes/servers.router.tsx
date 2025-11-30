import { RouteObject } from 'react-router-dom';
import { HomePage } from '../pages/home-page';
import { channelsRouter } from './channels.router';
import { settingsRouter } from './settings.router';

export const serversRouter: RouteObject = {
  path: 's/:serverSlug',
  children: [
    {
      index: true,
      element: <HomePage />,
    },
    settingsRouter,
    channelsRouter,
  ],
};
