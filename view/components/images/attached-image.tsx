import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { cn } from '@/lib/shared.utils';
import { Image } from '@/types/image.types';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from './lazy-load-image';

interface Props {
  image: Image;
  onImageLoad?(): void;
  className?: string;
}

export const AttachedImage = ({ image, onImageLoad, className }: Props) => {
  const queryClient = useQueryClient();
  const previouslyLoaded = queryClient.getQueryData(['image', image.id]);

  const [isLoaded, setIsLoaded] = useState(previouslyLoaded);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isError, setIsError] = useState(false);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const imageClassName = cn(
    'w-full',
    isLoaded
      ? 'cursor-pointer h-auto'
      : `cursor-default ${isError ? 'h-2' : isDesktop ? 'h-[400px]' : 'h-[300px]'}`,
    className,
  );

  const enlargedImageClassName = cn(
    'object-contain max-w-full max-h-[80%]',
    isDesktop ? 'rounded' : '',
  );

  const handleLoad = () => {
    onImageLoad?.();
    setIsLoaded(true);
  };

  const handleClick = () => {
    if (isLoaded) {
      setIsEnlarged(true);
    }
  };

  return (
    <>
      <Dialog open={isEnlarged} onOpenChange={setIsEnlarged}>
        <DialogContent className="flex h-full w-full flex-col justify-center border-none bg-black/90 p-0">
          {isEnlarged && (
            <LazyLoadImage
              alt={t('images.labels.attachedImage')}
              className={enlargedImageClassName}
              imageId={image.id}
              onError={() => setIsError(true)}
            />
          )}
        </DialogContent>
      </Dialog>

      <LazyLoadImage
        imageId={image.id}
        alt={t('images.labels.attachedImage')}
        className={imageClassName}
        isPlaceholder={image.isPlaceholder}
        onClick={handleClick}
        onError={() => setIsError(true)}
        onLoad={handleLoad}
      />
    </>
  );
};
