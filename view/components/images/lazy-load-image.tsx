import { Box } from '@/components/ui/box';
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
    });

    const [loaded, setLoaded] = useState(!!srcFromImageId);
    const [failed, setFailed] = useState(false);

    const { t } = useTranslation();

    const resolvedSrc = src || srcFromImageId;
    const showImage = resolvedSrc && !isPlaceholder && !failed;
    const elementType = showImage ? 'img' : 'div';
    const showFileMissing = failed && elementType === 'div' && !isPlaceholder;

    const imageClassName = cn(
      'object-cover',
      !skipAnimation && 'transition-all duration-300',
      !skipAnimation && (loaded ? 'blur-0 opacity-100' : 'blur-sm opacity-0'),
      className,
    );

    const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
      onLoad && onLoad(event);
      setLoaded(true);
    };

    return (
      <>
        <Box
          ref={setRef}
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
  },
);

LazyLoadImage.displayName = 'LazyLoadImage';
