import { Box } from '@/components/ui/box';
import { useImageSrc } from '@/hooks/use-image-src';
import { cn } from '@/lib/shared.utils';
import {
  ComponentProps,
  SyntheticEvent,
  forwardRef,
  useRef,
  useState,
  useEffect,
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
  onLoadingStatusChange?: (status: 'idle' | 'loading' | 'loaded' | 'error') => void;
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
      onLoadingStatusChange,
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

    // Communicate loading status to Avatar context
    useEffect(() => {
      if (!onLoadingStatusChange) {
        return;
      }

      const resolvedSrc = src || srcFromImageId;
      
      if (!resolvedSrc) {
        onLoadingStatusChange('idle');
        return;
      }

      if (failed) {
        onLoadingStatusChange('error');
        return;
      }

      if (loaded) {
        onLoadingStatusChange('loaded');
        return;
      }

      // If we have a source but haven't loaded yet, we're loading
      onLoadingStatusChange('loading');
    }, [src, srcFromImageId, loaded, failed, onLoadingStatusChange]);

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
    const showFileMissing = failed && elementType === 'div' && !isPlaceholder;

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
