import { useNavigate } from 'react-router-dom';
import { TopNav } from '../../components/nav/top-nav';
import { NavigationPaths } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/use-is-desktop';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/app.store';
import { MdClose } from 'react-icons/md';

export const EditUserProfile = () => {
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
        header={t('users.actions.editProfile')}
        onBackClick={handleBackClick}
        backBtnIcon={<MdClose className="size-6" />}
        goBackOnEscape
      />
    </>
  );
};
