// TODO: Add remaining layout and functionality - below is a WIP

import { TopNav } from '@/components/nav/top-nav';
import { SettingsNavItem } from '@/components/settings/settings-nav-item';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useTranslation } from 'react-i18next';
import { MdAdminPanelSettings, MdClose, MdGroups } from 'react-icons/md';

export const InstanceSettings = () => {
  const { t } = useTranslation();

  return (
    <>
      <TopNav
        header={t('navigation.headers.instanceSettings')}
        backBtnIcon={<MdClose className="size-6" />}
        goBackOnEscape
      />

      <Container className="flex flex-col gap-4.5">
        <SettingsNavItem
          Icon={MdAdminPanelSettings}
          label={t('navigation.labels.instanceRoles')}
          to={NavigationPaths.Roles}
        />
        <SettingsNavItem
          Icon={MdGroups}
          label={t('settings.headers.manageServers')}
          to={NavigationPaths.ManageServers}
        />
      </Container>
    </>
  );
};
