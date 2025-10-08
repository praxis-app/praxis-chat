import { useImageSrc } from '@/hooks/use-image-src';
import { cn } from '@/lib/shared.utils';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdRemoveCircle } from 'react-icons/md';
import { ImageRes } from '../../types/image.types';
import { Button } from '../ui/button';

const RemoveButton = ({ onClick }: { onClick(): void }) => {
  const { t } = useTranslation();

  return (
    <Button
      aria-label={t('images.labels.removeImage')}
      onClick={onClick}
      variant="ghost"
      size="icon"
      className="absolute top-[-18px] right-[-18px] rounded-full"
    >
      <MdRemoveCircle className="size-6" />
    </Button>
  );
};

const SavedImagePreview = ({
  savedImage: { id },
  className,
  handleDelete,
}: {
  className?: string;
  handleDelete?(id: string): void;
  savedImage: ImageRes;
}) => {
  const { t } = useTranslation();

  const ref = useRef<HTMLDivElement>(null);
  const src = useImageSrc({
    imageId: id,
    ref,
  });

  return (
    <div ref={ref} className={cn(className)}>
      <img alt={t('images.labels.attachedImage')} src={src} width="100%" />
      {handleDelete && <RemoveButton onClick={() => handleDelete(id)} />}
    </div>
  );
};

interface Props {
  handleDelete?: (id: string) => void;
  handleRemove?: (imageName: string) => void;
  imageContainerClassName?: string;
  savedImages?: ImageRes[];
  selectedImages: File[];
  className?: string;
}

export const AttachedImagePreview = ({
  handleDelete,
  handleRemove,
  imageContainerClassName,
  savedImages,
  selectedImages,
  className,
}: Props) => {
  const { t } = useTranslation();

  const containerClassName = cn(
    'mb-2 mr-3.5 relative w-42.5',
    imageContainerClassName,
  );

  return (
    <div
      data-testid="attached-image-preview"
      aria-label={t('images.labels.attachedImagePreview')}
      role="img"
      className={cn('mt-2 flex flex-wrap', className)}
    >
      {savedImages &&
        savedImages.map((savedImage) => (
          <SavedImagePreview
            key={savedImage.id}
            className={containerClassName}
            handleDelete={handleDelete}
            savedImage={savedImage}
          />
        ))}

      {selectedImages.map((image) => (
        <div className={containerClassName} key={image.name}>
          <img alt={image.name} src={URL.createObjectURL(image)} width="100%" />
          {handleRemove && (
            <RemoveButton onClick={() => handleRemove(image.name)} />
          )}
        </div>
      ))}
    </div>
  );
};
