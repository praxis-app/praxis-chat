import { dataSource } from '../database/data-source';
import { deleteImageFile } from './images.utils';
import { Image } from './entities/image.entity';

const imageRepository = dataSource.getRepository(Image);

export const getImage = async (imageId: string) => {
  return imageRepository.findOne({
    where: { id: imageId },
  });
};

export const deleteImage = async (imageId: string) => {
  const image = await imageRepository.findOne({
    where: { id: imageId },
    select: ['filename'],
  });
  if (!image || !image.filename) {
    throw new Error('Image not found');
  }
  await deleteImageFile(image.filename);
  await imageRepository.delete(imageId);
};
