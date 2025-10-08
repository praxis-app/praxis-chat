import { RouteObject } from 'react-router-dom';
import { EditUserProfile } from '../pages/users/edit-user-profile';

export const usersRouter: RouteObject = {
  path: '/users',
  children: [
    {
      path: 'edit',
      element: <EditUserProfile />,
    },
  ],
};
