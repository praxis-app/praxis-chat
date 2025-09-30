import { cn } from '@/lib/shared.utils';
import chroma from 'chroma-js';
import ColorHash from 'color-hash';
import { LazyLoadImage } from '../images/lazy-load-image';
import { Avatar, AvatarBadge, AvatarFallback } from '../ui/avatar';

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
  const getStringAvatarProps = () => {
    const colorHash = new ColorHash();
    const baseColor = colorHash.hex(userId ?? name);
    const color = chroma(baseColor).brighten(1.5).hex();
    const backgroundColor = chroma(baseColor).darken(1.35).hex();

    return {
      style: { color, backgroundColor },
    };
  };

  return (
    <Avatar className={className} title={name}>
      <LazyLoadImage
        alt={name}
        imageId={imageId}
        src={imageSrc}
        className={cn(
          (imageId || imageSrc) && 'min-h-full min-w-full rounded-full',
        )}
      />

      {!imageSrc && !imageId && (
        <AvatarFallback
          className={cn(
            'min-h-full min-w-full rounded-full text-lg font-light',
            fallbackClassName,
          )}
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
