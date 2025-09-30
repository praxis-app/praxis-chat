import { cn } from '@/lib/shared.utils';
import chroma from 'chroma-js';
import ColorHash from 'color-hash';
import { LazyLoadImage } from '../images/lazy-load-image';
import { AvatarBadge } from '../ui/avatar';
import * as React from 'react';

// Custom Avatar components that integrate LazyLoadImage
const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('relative flex h-10 w-10 shrink-0 rounded-full', className)}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src?: string;
    imageId?: string;
    alt: string;
    onLoad?: () => void;
    onError?: () => void;
  }
>(({ className, src, imageId, alt, onLoad, onError, ...props }, ref) => {
  // Only render if we have a source
  if (!src && !imageId) {
    return null;
  }

  // Always render LazyLoadImage - it will handle its own loading state
  return (
    <LazyLoadImage
      ref={ref}
      src={src}
      imageId={imageId}
      className={className}
      alt={alt}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
});
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'bg-muted flex h-full w-full items-center justify-center rounded-full',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

interface Props {
  name: string;
  userId?: string | null;
  className?: string;
  fallbackClassName?: string;
  imageSrc?: string;
  imageId?: string;
  isOnline?: boolean;
  showOnlineStatus?: boolean;
  animateOnlineStatus?: boolean;
}

export const UserAvatar = ({
  name,
  userId,
  className,
  imageSrc,
  fallbackClassName,
  imageId,
  isOnline,
  showOnlineStatus,
  animateOnlineStatus,
}: Props) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const handleImageLoad = React.useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = React.useCallback(() => {
    setImageLoaded(false);
    setImageError(true);
  }, []);

  const getStringAvatarProps = () => {
    const colorHash = new ColorHash();
    const baseColor = colorHash.hex(userId ?? name);
    const color = chroma(baseColor).brighten(1.5).hex();
    const backgroundColor = chroma(baseColor).darken(1.35).hex();

    return {
      style: { color, backgroundColor },
    };
  };

  const hasImageSource = !!(imageSrc || imageId);
  const showImage = hasImageSource && imageLoaded && !imageError;
  const showFallback = !hasImageSource || imageError || !imageLoaded;

  return (
    <Avatar className={cn(className)} title={name}>
      {hasImageSource && (
        <AvatarImage
          src={imageSrc}
          imageId={imageId}
          alt={name}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={cn(
            'aspect-square h-full w-full rounded-full object-cover',
            'absolute top-0 left-0 transition-opacity duration-200',
            showImage ? 'opacity-100 z-10' : 'opacity-0 z-0'
          )}
        />
      )}

      {showFallback && (
        <AvatarFallback
          className={cn('text-lg font-light', fallbackClassName)}
          {...getStringAvatarProps()}
        >
          {name[0].toUpperCase()}
        </AvatarFallback>
      )}

      {showOnlineStatus && isOnline && (
        <AvatarBadge
          position="bottomRight"
          className="border-card h-[15px] w-[15px] border-[2.5px]"
        >
          <span className="relative">
            {animateOnlineStatus && (
              <span className="absolute h-full w-full animate-ping rounded-full bg-(--positive) opacity-75"></span>
            )}
            {/* TODO: Add positive token to theme inline for more convenient syntax */}
            <span className="absolute h-full w-full rounded-full bg-(--positive)"></span>
          </span>
        </AvatarBadge>
      )}
    </Avatar>
  );
};
