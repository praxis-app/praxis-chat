import { SERVER_PERMISSION_KEYS } from '@/constants/server-role.constants';
import { t } from 'i18next';
import { Namespace, TFunction } from 'react-i18next';
import { ServerPermission, ServerPermissionKeys } from '../types/role.types';

export const getPermissionValues = (permissions: ServerPermission[]) =>
  SERVER_PERMISSION_KEYS.map((name) => {
    if (name === 'manageChannels') {
      return {
        value: permissions.some(
          (p) => p.subject === 'Channel' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'manageSettings') {
      return {
        value: permissions.some(
          (p) => p.subject === 'ServerConfig' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'manageRoles') {
      return {
        value: permissions.some(
          (p) => p.subject === 'ServerRole' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'createInvites') {
      return {
        value: permissions.some(
          (p) => p.subject === 'Invite' && p.action.includes('create'),
        ),
        name,
      };
    }
    if (name === 'manageInvites') {
      return {
        value: permissions.some(
          (p) => p.subject === 'Invite' && p.action.includes('manage'),
        ),
        name,
      };
    }
    return {
      value: false,
      name,
    };
  });

export const getPermissionValuesMap = (permissions: ServerPermission[]) =>
  getPermissionValues(permissions).reduce<Record<string, boolean>>(
    (result, permission) => {
      result[permission.name] = permission.value;
      return result;
    },
    {},
  );

export const getPermissionText = (name: ServerPermissionKeys) => {
  const _t: TFunction<Namespace<'translation'>, undefined> = t;
  return {
    displayName: _t(`permissions.names.${name}`),
    description: _t(`permissions.descriptions.${name}`),
  };
};
