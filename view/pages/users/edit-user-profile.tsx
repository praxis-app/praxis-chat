import { TopNav } from '@/components/nav/top-nav';
import { Card, CardContent } from '@/components/ui/card';
import { UserProfileForm } from '@/components/users/user-profile-form';
import { NavigationPaths } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useMeQuery } from '@/hooks/use-me-query';
import { useAppStore } from '@/store/app.store';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../../client/api-client';

export const EditUserProfile = () => {
  const { setIsNavSheetOpen } = useAppStore();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const { data: meData } = useMeQuery();
  const userId = meData?.user?.id || '';

  const { data: profileData } = useQuery({
    queryKey: ['users', userId, 'profile'],
    queryFn: () => api.getUserProfile(userId),
    enabled: !!userId,
  });

  const handleBackClick = () => {
    if (isDesktop) {
      navigate(NavigationPaths.Home);
      return;
    }
    setIsNavSheetOpen(true);
  };

  if (!meData?.user || !profileData?.user) {
    return null;
  }

  if (meData.user.anonymous) {
    return <Navigate to={NavigationPaths.Home} />;
  }

  return (
    <>
      <TopNav
        header={t('users.actions.editProfile')}
        onBackClick={handleBackClick}
        backBtnIcon={<MdClose className="size-6" />}
        goBackOnEscape
      />

      <div className="flex h-full flex-col items-center justify-center p-4 md:p-18">
        <Card className="w-full max-w-md">
          <CardContent>
            <UserProfileForm userProfile={profileData.user} me={meData.user} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};
