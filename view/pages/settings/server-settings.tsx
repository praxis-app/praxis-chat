import { TopNav } from '@/components/nav/top-nav';
import { SettingsNavItem } from '@/components/settings/settings-nav-item';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useAppStore } from '@/store/app.store';
import { useTranslation } from 'react-i18next';
import { MdAdminPanelSettings, MdClose, MdLink } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export const ServerSettings = () => {
  const { setIsNavSheetOpen } = useAppStore();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const handleBackClick = () => {
    if (isDesktop) {
      navigate(NavigationPaths.Home);
      return;
    }
    setIsNavSheetOpen(true);
  };

  return (
    <>
      <TopNav
        header={t('navigation.labels.serverSettings')}
        onBackClick={handleBackClick}
        backBtnIcon={<MdClose className="size-6" />}
      />

      <Container className="flex flex-col gap-4.5">
        <SettingsNavItem
          Icon={MdLink}
          label={t('navigation.labels.invites')}
          to={NavigationPaths.Invites}
        />
        <SettingsNavItem
          Icon={MdAdminPanelSettings}
          label={t('navigation.labels.roles')}
          to={NavigationPaths.Roles}
        />
      </Container>
    </>
  );
};
