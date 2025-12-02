import { TopNav } from '@/components/nav/top-nav';
import { NavigationPaths } from '@/constants/shared.constants';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const ManageServers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <TopNav
        header={t('settings.headers.manageServers')}
        onBackClick={() => navigate(NavigationPaths.Settings)}
      />
    </>
  );
};
