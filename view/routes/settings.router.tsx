import { EditRolePage } from '@/pages/settings/edit-role-page';
import { PollSettings } from '@/pages/settings/poll-settings';
import { ServerRoles } from '@/pages/settings/server-roles';
import { ServerSettings } from '@/pages/settings/server-settings';
import { RouteObject } from 'react-router-dom';
import { InvitesPage } from '../pages/invites/invites-page';

export const settingsRouter: RouteObject = {
  path: '/settings',
  children: [
    {
      index: true,
      element: <ServerSettings />,
    },
    {
      path: 'invites',
      element: <InvitesPage />,
    },
    {
      path: 'proposals',
      element: <PollSettings />,
    },
    {
      path: 'roles',
      children: [
        {
          index: true,
          element: <ServerRoles />,
        },
        {
          path: ':roleId/edit',
          element: <EditRolePage />,
        },
      ],
    },
  ],
};
