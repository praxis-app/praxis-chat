import * as fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getUploadsPath = () => `${__dirname}/../../content`;

export const deleteImageFile = async (filename: string) => {
  const unlinkAsync = promisify(fs.unlink);
  const uploadsPath = getUploadsPath();
  const imagePath = `${uploadsPath}/${filename}`;
  await unlinkAsync(imagePath);
};
