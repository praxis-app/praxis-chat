// TODO: Add remaining layout and functionality - below is a WIP

import { EditInstanceRolePage } from '@/pages/settings/instance-roles/edit-instance-role-page';
import { InstanceRoles } from '@/pages/settings/instance-roles/instance-roles';
import { InstanceSettings } from '@/pages/settings/instance-roles/instance-settings';
import { RouteObject } from 'react-router-dom';

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
