import { useImageSrc } from '@/hooks/use-image-src';
import { cn } from '@/lib/shared.utils';
import {
  ComponentProps,
  SyntheticEvent,
  forwardRef,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends ComponentProps<'img'> {
  alt: string;
  skipAnimation?: boolean;
  isPlaceholder?: boolean;
  imageId?: string;
  channelId?: string;
  messageId?: string;
  pollId?: string;
  userId?: string;
  src?: string;
  className?: string;
  onError?: () => void;
}

/**
 * LazyLoadImage component with ref forwarding support.
 *
 * Uses dual ref system:
 * - internalRef: For useImageSrc/useInView intersection observer (needs stable RefObject)
 * - forwardedRef: For parent components like DialogTrigger (needs DOM element access)
 *
 * This is necessary because:
 * 1. IntersectionObserver requires a stable RefObject<HTMLElement>
 * 2. DialogTrigger with asChild needs a ref to the DOM element for accessibility/focus
 * 3. ForwardedRef can be null or a function, which breaks IntersectionObserver
 */
export const LazyLoadImage = forwardRef<HTMLDivElement, Props>(
  (
    {
      alt,
      skipAnimation = false,
      isPlaceholder,
      imageId,
      channelId,
      messageId,
      pollId,
      userId,
      onLoad,
      src,
      className,
      onError,
      ...imgProps
    },
    forwardedRef,
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null);

    const setRef = (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const srcFromImageId = useImageSrc({
      enabled: !isPlaceholder,
      ref: internalRef,
      onError: () => {
        setFailed(true);
        onError?.();
      },
      imageId,
      channelId,
      messageId,
      pollId,
      userId,
    });

    const [loaded, setLoaded] = useState(!!srcFromImageId);
    const [failed, setFailed] = useState(false);

    const { t } = useTranslation();

    const resolvedSrc = src || srcFromImageId;
    const showImage = resolvedSrc && !isPlaceholder && !failed;
    const showFileMissing = failed && !showImage && !isPlaceholder;

    const shouldShowPlaceholderBackground =
      isPlaceholder || !loaded || !showImage;

    const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
      onLoad && onLoad(event);
      setLoaded(true);
    };

    const handleError = () => {
      setFailed(true);
      onError?.();
    };

    return (
      <>
        <div
          ref={setRef}
          className={cn(
            'relative overflow-hidden transition-colors duration-200',
            shouldShowPlaceholderBackground && 'bg-muted',
            className, // TODO: Determine if this is also needed for the container
          )}
        >
          {showImage ? (
            <img
              alt={alt}
              onLoad={handleLoad}
              onError={handleError}
              src={resolvedSrc}
              loading={resolvedSrc ? 'lazy' : undefined}
              className={cn(
                'h-full w-full object-cover',
                !skipAnimation && 'transition-[filter,opacity] duration-300',
                !skipAnimation && !loaded && 'opacity-0 blur-sm',
                !skipAnimation && loaded && 'blur-0 opacity-100',
                className,
              )}
              {...imgProps}
            />
          ) : null}
        </div>
        {showFileMissing && (
          <div className="text-muted-foreground text-sm">
            {t('images.errors.fileMissing')}
          </div>
        )}
      </>
    );
  },
);

LazyLoadImage.displayName = 'LazyLoadImage';
