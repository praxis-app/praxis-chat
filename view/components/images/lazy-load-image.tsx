import { Box } from '@/components/ui/box';
import { useImageSrc } from '@/hooks/use-image-src';
import { cn } from '@/lib/shared.utils';
import { ComponentProps, SyntheticEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends ComponentProps<'img'> {
  alt: string;
  skipAnimation?: boolean;
  isPlaceholder?: boolean;
  imageId?: string;
  src?: string;
  className?: string;
  onError?: () => void;
}

export const LazyLoadImage = ({
  alt,
  skipAnimation = false,
  isPlaceholder,
  imageId,
  onLoad,
  src,
  className,
  onError,
  ...imgProps
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const srcFromImageId = useImageSrc({
    enabled: !isPlaceholder,
    imageId,
    onError,
    ref,
  });
  const [loaded, setLoaded] = useState(!!srcFromImageId);
  const [failed, setFailed] = useState(false);
  const { t } = useTranslation();

  const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    onLoad && onLoad(event);
    setLoaded(true);
  };

  const imageClassName = cn(
    'object-cover',
    !skipAnimation && 'transition-all duration-300',
    !skipAnimation && (loaded ? 'blur-0 opacity-100' : 'blur-sm opacity-0'),
    className,
  );

  const resolvedSrc = src || srcFromImageId;
  const elementType = isPlaceholder || !resolvedSrc || failed ? 'div' : 'img';
  const showFileMissing = elementType === 'div' && !isPlaceholder;

  return (
    <>
      <Box
        ref={ref}
        alt={alt}
        as={elementType}
        loading={resolvedSrc ? 'lazy' : undefined}
        onLoad={handleLoad}
        onError={() => {
          setFailed(true);
          onError?.();
        }}
        src={resolvedSrc}
        className={imageClassName}
        {...imgProps}
      />
      {showFileMissing && (
        <div className="text-muted-foreground text-sm">
          {t('images.errors.fileMissing')}
        </div>
      )}
    </>
  );
};
