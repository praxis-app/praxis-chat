import { useQuery } from '@tanstack/react-query';
import { RefObject } from 'react';
import { api } from '../client/api-client';
import { useInView } from './use-in-view';

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
  const { viewed } = useInView(ref, '100px');

  const getImageSrc = async () => {
    if (!imageId) {
      return '';
    }
    try {
      let result: Blob;

      // Determine which API method to call based on parent context
      if (messageId && channelId) {
        result = await api.getMessageImage(channelId, messageId, imageId);
      } else if (pollId && channelId) {
        result = await api.getPollImage(channelId, pollId, imageId);
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
    queryKey: ['images', channelId, imageId, messageId, pollId, userId],
    queryFn: getImageSrc,
    enabled: enabled && !!imageId && viewed,
  });

  return data;
};
