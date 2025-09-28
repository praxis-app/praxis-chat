import { TopNav } from '@/components/nav/top-nav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserProfileForm } from '@/components/users/user-profile-form';
import { NavigationPaths } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useMeQuery } from '@/hooks/use-me-query';
import { useAppStore } from '@/store/app.store';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export const EditUserProfile = () => {
  const { setIsNavSheetOpen } = useAppStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const { data: meData, isLoading } = useMeQuery();

  const handleBackClick = () => {
    if (isDesktop) {
      navigate(NavigationPaths.Home);
      return;
    }
    setIsNavSheetOpen(true);
  };

  if (isLoading || !meData?.user) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('users.headers.editProfile')}
        onBackClick={handleBackClick}
        backBtnIcon={<MdClose className="size-6" />}
        goBackOnEscape
      />

      <div className="flex h-full flex-col items-center justify-center p-4 md:p-18">
        <Card className="w-full max-w-md">
          <CardHeader>
            <VisuallyHidden>
              <CardTitle>{t('users.headers.editProfile')}</CardTitle>
            </VisuallyHidden>
            <CardDescription>
              {t('users.headers.editProfileDescription')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <UserProfileForm currentUser={meData.user} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};
