import { TopNav } from '@/components/nav/top-nav';
import { SettingsNavItem } from '@/components/settings/settings-nav-item';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useAppStore } from '@/store/app.store';
import { useTranslation } from 'react-i18next';
import {
  MdAdminPanelSettings,
  MdClose,
  MdEmojiPeople,
  MdLink,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useServerData } from '../../hooks/use-server-data';

export const ServerSettings = () => {
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
        header={t('navigation.headers.serverSettings')}
        onBackClick={handleBackClick}
        backBtnIcon={<MdClose className="size-6" />}
        goBackOnEscape
      />

      <Container className="flex flex-col gap-4.5">
        <SettingsNavItem
          Icon={MdEmojiPeople}
          label={t('navigation.labels.proposals')}
          to={`${serverPath}${NavigationPaths.ProposalSettings}`}
        />
        <SettingsNavItem
          Icon={MdLink}
          label={t('navigation.labels.invites')}
          to={`${serverPath}${NavigationPaths.Invites}`}
        />
        <SettingsNavItem
          Icon={MdAdminPanelSettings}
          label={t('navigation.labels.roles')}
          to={`${serverPath}${NavigationPaths.Roles}`}
        />
      </Container>
    </>
  );
};
