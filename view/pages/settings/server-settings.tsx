import { TopNav } from '@/components/nav/top-nav';
import { SettingsNavItem } from '@/components/settings/settings-nav-item';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useTranslation } from 'react-i18next';
import {
  MdAdminPanelSettings,
  MdClose,
  MdEmojiPeople,
  MdLink,
  MdSettings,
} from 'react-icons/md';
import { useServerData } from '../../hooks/use-server-data';

export const ServerSettings = () => {
  const { t } = useTranslation();

  const { serverPath } = useServerData();

  return (
    <>
      <TopNav
        header={t('navigation.headers.serverSettings')}
        backBtnIcon={<MdClose className="size-6" />}
        goBackOnEscape
      />

      <Container className="flex flex-col gap-4.5">
        <SettingsNavItem
          Icon={MdSettings}
          label={t('navigation.labels.general')}
          to={`${serverPath}${NavigationPaths.GeneralSettings}`}
        />
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
