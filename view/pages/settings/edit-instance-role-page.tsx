// TODO: Add remaining layout and functionality - below is a WIP

import { PermissionDenied } from '@/components/shared/permission-denied';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '../../components/nav/top-nav';
import { NavigationPaths } from '../../constants/shared.constants';
import { useAbility } from '../../hooks/use-ability';

export const EditInstanceRolePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { instanceAbility, isLoading: isAbilityLoading } = useAbility();
  const canManageInstanceRoles = instanceAbility.can('manage', 'InstanceRole');

  if (isAbilityLoading) {
    return null;
  }

  if (!canManageInstanceRoles) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('roles.headers.instanceRoles'),
          onBackClick: () => navigate(NavigationPaths.Settings),
        }}
      />
    );
  }

  return (
    <>
      <TopNav
        header={'TODO: Instance role name here'}
        onBackClick={() => navigate(NavigationPaths.Roles)}
      />
    </>
  );
};
