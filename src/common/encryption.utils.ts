import * as crypto from 'crypto';
import { AES_256_GCM_ALGORITHM, AES_256_GCM_IV_LENGTH } from './common.constants';

export const encryptText = (plaintext: string, key: Buffer) => {
  const iv = crypto.randomBytes(AES_256_GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv(AES_256_GCM_ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { ciphertext, tag, iv };
};

export const decryptText = (
  ciphertext: Buffer,
  tag: Buffer,
  iv: Buffer,
  key: Buffer,
) => {
  const decipher = crypto.createDecipheriv(AES_256_GCM_ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString();
};
