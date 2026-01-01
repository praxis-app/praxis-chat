import { api } from '@/client/api-client';
import { useAppStore } from '@/store/app.store';
import { useQuery } from '@tanstack/react-query';
import { useMeQuery } from './use-me-query';
import { NavigationPaths } from '@/constants/shared.constants';

export const useAuthData = () => {
  const { isLoggedIn, accessToken, inviteToken } = useAppStore();

  const {
    data: meData,
    isLoading: isMeLoading,
    isSuccess: isMeSuccess,
    isError: isMeError,
  } = useMeQuery({ enabled: isLoggedIn });

  const { data } = useQuery({
    queryKey: ['is-first-user'],
    queryFn: api.isFirstUser,
    enabled: isMeError || !accessToken,
  });

  const me = meData?.user;
  const isAnon = !!me && me.anonymous === true;
  const isRegistered = !!me && me.anonymous === false;
  const isFirstUser = !!data?.isFirstUser;
  const isInvited = !!inviteToken;

  const signUpPath =
    isFirstUser || !inviteToken
      ? NavigationPaths.SignUp
      : `${NavigationPaths.SignUp}/${inviteToken}`;

  const getShowSignUp = () => {
    if (isAnon) {
      return true;
    }
    if (isLoggedIn) {
      return false;
    }
    return isFirstUser || isInvited;
  };

  return {
    isAnon,
    isRegistered,
    isInvited: !!inviteToken,
    isFirstUser: data?.isFirstUser,
    showSignUp: getShowSignUp(),
    inviteToken,
    signUpPath,
    isMeLoading,
    isMeSuccess,
    isMeError,
    accessToken,
    isLoggedIn,
    me,
  };
};
