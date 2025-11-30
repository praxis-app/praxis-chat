// TODO: Add remaining layout and functionality - below is a WIP

import { RouteObject } from 'react-router-dom';
import { EditInstanceRolePage } from '../pages/settings/edit-instance-role-page';
import { InstanceRoles } from '../pages/settings/instance-roles';
import { InstanceSettings } from '../pages/settings/instance-settings';

export const instanceSettingsRouter: RouteObject = {
  path: '/settings',
  children: [
    {
      index: true,
      element: <InstanceSettings />,
    },
    {
      path: 'roles',
      children: [
        {
          index: true,
          element: <InstanceRoles />,
        },
        {
          path: ':instanceRoleId/edit',
          element: <EditInstanceRolePage />,
        },
      ],
    },
  ],
};
