// TODO: Add remaining layout and functionality - below is a WIP

import { RouteObject } from 'react-router-dom';
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
          element: <div />,
        },
        {
          path: ':instanceRoleId/edit',
          element: <div />,
        },
      ],
    },
  ],
};
