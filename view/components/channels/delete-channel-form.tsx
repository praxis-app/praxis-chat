import { api } from '@/client/api-client';
import { NavigationPaths } from '@/constants/shared.constants';
import { ChannelRes } from '@/types/channel.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MdTag } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface DeleteChannelFormSubmitButtonProps {
  isSubmitting: boolean;
}

interface DeleteChannelFormProps {
  channel: ChannelRes;
  submitButton: (props: DeleteChannelFormSubmitButtonProps) => ReactNode;
  onSubmit?(): void;
}

export const DeleteChannelFormSubmitButton = ({
  isSubmitting,
}: DeleteChannelFormSubmitButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button type="submit" variant="destructive" disabled={isSubmitting}>
      {isSubmitting ? t('states.deleting') : t('actions.delete')}
    </Button>
  );
};

export const DeleteChannelForm = ({
  channel,
  submitButton,
  onSubmit,
}: DeleteChannelFormProps) => {
  const { channelId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: deleteChannel, isPending } = useMutation({
    mutationFn: async () => {
      await api.deleteChannel(channel.id);

      queryClient.setQueryData<{ channels: ChannelRes[] }>(
        ['channels'],
        (oldData) => {
          if (!oldData) {
            return { channels: [] };
          }
          return {
            channels: oldData.channels.filter((c) => c.id !== channel.id),
          };
        },
      );

      onSubmit?.();

      if (channelId === channel.id) {
        navigate(NavigationPaths.Home);
      }
    },
    onError(error: Error) {
      if (error instanceof AxiosError && error.response?.data) {
        toast(error.response?.data);
        return;
      }
      toast(error.message || t('errors.somethingWentWrong'));
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        deleteChannel();
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <MdTag className="text-muted-foreground size-5" />
          <div>{channel.name}</div>
        </div>
        <div className="flex justify-end">
          {submitButton({ isSubmitting: isPending })}
        </div>
      </div>
    </form>
  );
};
