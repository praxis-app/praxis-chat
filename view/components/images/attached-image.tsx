import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/shared.utils';
import { ImageRes } from '@/types/image.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from './lazy-load-image';

interface Props {
  image: ImageRes;
  channelId?: string;
  messageId?: string;
  pollId?: string;
  onImageLoad?(): void;
  className?: string;
}

export const AttachedImage = ({
  image,
  channelId,
  messageId,
  pollId,
  onImageLoad,
  className,
}: Props) => {
  const queryClient = useQueryClient();
  const previouslyLoaded = queryClient.getQueryData([
    'images',
    channelId,
    image.id,
    messageId,
    pollId,
    undefined,
  ]);

  const [isLoaded, setIsLoaded] = useState(!!previouslyLoaded);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isError, setIsError] = useState(false);

  const { t } = useTranslation();

  const handleLoad = () => {
    onImageLoad?.();
    setIsLoaded(true);
  };

  const handleClick = () => {
    if (isLoaded) {
      setIsDialogOpen(true);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <LazyLoadImage
          imageId={image.id}
          channelId={channelId}
          messageId={messageId}
          pollId={pollId}
          src={image.src}
          alt={t('images.labels.attachedImage')}
          className={cn(
            'w-full cursor-default',
            isLoaded && 'h-auto cursor-pointer',
            !isLoaded && (isError ? 'h-2' : 'h-[300px]'),
            className,
          )}
          isPlaceholder={image.isPlaceholder}
          onClick={handleClick}
          onError={() => setIsError(true)}
          onLoad={handleLoad}
        />
      </DialogTrigger>

      <DialogContent className="flex h-full w-full flex-col justify-center border-none bg-black/90 p-0 md:h-full md:px-5">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>{t('images.labels.attachedImage')}</DialogTitle>
            <DialogDescription>
              {t('images.descriptions.attachedImage')}
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        {isDialogOpen && (
          <LazyLoadImage
            alt={t('images.labels.attachedImage')}
            className="max-h-[80%] max-w-full object-contain md:self-center md:rounded"
            imageId={image.id}
            channelId={channelId}
            messageId={messageId}
            pollId={pollId}
            src={image.src}
            onError={() => setIsError(true)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
