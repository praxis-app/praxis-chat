import { t } from 'i18next';
import { Namespace, TFunction } from 'react-i18next';
import { PermissionKeys } from '../types/role.types';

export const getPermissionText = (name: PermissionKeys) => {
  const _t: TFunction<Namespace<'translation'>, undefined> = t;
  switch (name) {
    case 'manageChannels':
      return {
        displayName: _t('permissions.names.manageChannels'),
        description: _t('permissions.descriptions.manageChannels'),
      };
    case 'manageSettings':
      return {
        displayName: _t('permissions.names.manageSettings'),
        description: _t('permissions.descriptions.manageServerSettings'),
      };
    case 'createInvites':
      return {
        displayName: _t('permissions.names.createInvites'),
        description: _t('permissions.descriptions.createInvites'),
      };
    case 'manageInvites':
      return {
        displayName: _t('permissions.names.manageInvites'),
        description: _t('permissions.descriptions.manageInvites'),
      };
    case 'manageRoles':
      return {
        displayName: _t('permissions.names.manageRoles'),
        description: _t('permissions.descriptions.manageRoles'),
      };
  }
  return { displayName: '', description: '' };
};
