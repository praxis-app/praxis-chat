import { api } from '@/client/api-client';
import { useInView } from '@/hooks/use-in-view';
import { useServerData } from '@/hooks/use-server-data';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { RefObject } from 'react';

interface UseImageSrcProps {
  enabled?: boolean;
  imageId?: string;
  channelId?: string;
  messageId?: string;
  pollId?: string;
  userId?: string;
  onError?: () => void;
  ref: RefObject<HTMLElement>;
}

export const useImageSrc = ({
  enabled = true,
  imageId,
  channelId,
  messageId,
  pollId,
  userId,
  onError,
  ref,
}: UseImageSrcProps) => {
  const { inviteToken } = useAuthStore();
  const { serverId } = useServerData();

  const { viewed } = useInView(ref, '100px');

  const getImageSrc = async () => {
    if (!imageId) {
      return '';
    }
    try {
      let result: Blob;

      // Determine which API method to call based on parent context
      if (messageId && channelId) {
        if (!serverId) {
          throw new Error('Server ID is required for message images');
        }
        result = await api.getMessageImage(
          serverId,
          channelId,
          messageId,
          imageId,
          inviteToken,
        );
      } else if (pollId && channelId) {
        if (!serverId) {
          throw new Error('Server ID is required for poll images');
        }
        result = await api.getPollImage(
          serverId,
          channelId,
          pollId,
          imageId,
          inviteToken,
        );
      } else if (userId) {
        result = await api.getUserImage(userId, imageId);
      } else {
        throw new Error('Invalid image context: missing parent identifiers');
      }

      const url = URL.createObjectURL(result);
      return url;
    } catch {
      onError?.();
      // Gracefully handle missing image
      return '';
    }
  };

  const { data } = useQuery({
    queryKey: [
      'images',
      serverId,
      channelId,
      imageId,
      messageId,
      pollId,
      userId,
    ],
    queryFn: getImageSrc,
    enabled: !!imageId && viewed && enabled,
  });

  return data;
};
