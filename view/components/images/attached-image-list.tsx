import { Box } from '@/components/ui/box';
import { cn } from '@/lib/shared.utils';
import { ImageRes } from '@/types/image.types';
import { AttachedImage } from './attached-image';

interface Props {
  className?: string;
  fillCard?: boolean;
  imageClassName?: string;
  images: ImageRes[];
  onImageLoad?(): void;
  topRounded?: boolean;
}

export const AttachedImageList = ({
  className,
  fillCard,
  imageClassName,
  images,
  onImageLoad,
  topRounded,
}: Props) => (
  <Box className={cn(fillCard ? '-mx-8' : '', className)}>
    {images.map((image, index) => {
      const isLastImage = index + 1 === images.length;
      const isFirstImage = index === 0;

      const imageClasses = cn(
        !isLastImage && 'mb-3',
        topRounded && isFirstImage && 'rounded-t-lg',
        imageClassName,
      );

      return (
        <AttachedImage
          key={image.id}
          image={image}
          onImageLoad={onImageLoad}
          className={imageClasses}
        />
      );
    })}
  </Box>
);
