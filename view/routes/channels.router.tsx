import { ChannelSettings } from '@/pages/channels/channel-settings';
import { RouteObject } from 'react-router-dom';
import { ChannelPage } from '../pages/channels/channel-page';

export const channelsRouter: RouteObject = {
  path: '/s/:serverSlug/channels',
  children: [
    {
      path: ':channelId',
      element: <ChannelPage />,
    },
    {
      path: ':channelId/settings',
      element: <ChannelSettings />,
    },
  ],
};
