// TODO: Add remaining layout and functionality - below is a WIP

import { TopNav } from '@/components/nav/top-nav';
import { SettingsNavItem } from '@/components/settings/settings-nav-item';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useServerData } from '@/hooks/use-server-data';
import { useAppStore } from '@/store/app.store';
import { useTranslation } from 'react-i18next';
import { MdAdminPanelSettings, MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export const InstanceSettings = () => {
  const { setIsNavSheetOpen } = useAppStore();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const { serverPath } = useServerData();

  const handleBackClick = () => {
    if (isDesktop) {
      navigate(serverPath);
      return;
    }
    setIsNavSheetOpen(true);
  };

  return (
    <>
      <TopNav
        header={t('navigation.headers.instanceSettings')}
        onBackClick={handleBackClick}
        backBtnIcon={<MdClose className="size-6" />}
        goBackOnEscape
      />

      <Container className="flex flex-col gap-4.5">
        <SettingsNavItem
          Icon={MdAdminPanelSettings}
          label={t('navigation.labels.instanceRoles')}
          to={NavigationPaths.Roles}
        />
      </Container>
    </>
  );
};
