import { useQuery } from '@tanstack/react-query';
import { RefObject } from 'react';
import { api } from '../client/api-client';
import { useInView } from './use-in-view';

interface UseImageSrcProps {
  enabled?: boolean;
  imageId: string | undefined;
  onError?: () => void;
  ref: RefObject<HTMLElement>;
}

export const useImageSrc = ({
  enabled = true,
  imageId,
  onError,
  ref,
}: UseImageSrcProps) => {
  const { viewed } = useInView(ref, '100px');

  const getImageSrc = async () => {
    if (!imageId) {
      return '';
    }
    try {
      const result = await api.getImage(imageId);
      const url = URL.createObjectURL(result);
      return url;
    } catch {
      onError?.();
      // Gracefully handle missing image
      return '';
    }
  };

  const { data } = useQuery({
    queryKey: ['image', imageId],
    queryFn: getImageSrc,
    enabled: enabled && !!imageId && viewed,
  });

  return data;
};
