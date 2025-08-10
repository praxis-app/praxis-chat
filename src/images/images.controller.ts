import { Request, Response } from 'express';
import * as fs from 'fs';
import * as imagesService from './images.service';
import { getUploadsPath } from './images.utils';

export const getImageFile = async (req: Request, res: Response) => {
  const image = await imagesService.getImage(req.params.id);

  if (!image) {
    res.status(404).send('Image not found');
    return;
  }
  if (!image.filename) {
    res.status(404).send('Image has not been uploaded yet');
    return;
  }

  // If the file has been deleted from disk, return a 404
  const filePath = `${getUploadsPath()}/${image.filename}`;
  if (!fs.existsSync(filePath)) {
    res.status(404).send('Image file not found');
    return;
  }

  return res.sendFile(image.filename, {
    root: getUploadsPath(),
  });
};
