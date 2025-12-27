import { api } from '@/client/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LocalStorageKeys } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { handleError } from '@/lib/error.utils';
import { useAppStore } from '@/store/app.store';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  setIsOpen(isOpen: boolean): void;
  sendMessage(): Promise<void>;
}

export const ChooseAuthDialog = ({ isOpen, setIsOpen, sendMessage }: Props) => {
  const { inviteToken, setIsLoggedIn } = useAppStore((state) => state);

  const { mutate: createAnonSession } = useMutation({
    mutationFn: async () => {
      const { access_token } = await api.createAnonSession(inviteToken);
      localStorage.setItem(LocalStorageKeys.AccessToken, access_token);
      localStorage.removeItem(LocalStorageKeys.InviteToken);
      setIsLoggedIn(true);
      sendMessage();
    },
    onError(error: Error) {
      handleError(error);
      setIsOpen(false);
    },
  });

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUpPath } = useAuthData();

  const handleSendAnonMsgBtnClick = () => {
    createAnonSession();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader className="mt-9">
          <DialogTitle className="text-md font-normal">
            {t('auth.prompts.chooseAuthFlow')}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              {t('auth.prompts.chooseAuthFlow')}
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <DialogFooter className="flex flex-row gap-2 self-center">
          <Button onClick={handleSendAnonMsgBtnClick} variant="outline">
            {t('messages.actions.sendAnonymous')}
          </Button>
          <Button onClick={() => navigate(signUpPath)}>
            {t('auth.actions.signUp')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
