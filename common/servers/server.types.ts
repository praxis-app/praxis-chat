import * as zod from 'zod';
import { ServerErrorKeys } from './server.constants';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const serverFormSchema = zod.object({
  name: zod
    .string()
    .trim()
    .min(2, { message: ServerErrorKeys.NameLength })
    .max(30, { message: ServerErrorKeys.NameLength }),
  slug: zod
    .string()
    .trim()
    .min(2, { message: ServerErrorKeys.SlugLength })
    .max(30, { message: ServerErrorKeys.SlugLength })
    .regex(SLUG_PATTERN, { message: ServerErrorKeys.SlugInvalid }),
  description: zod
    .string()
    .trim()
    .max(255, { message: ServerErrorKeys.DescriptionLength })
    .optional(),
  isDefaultServer: zod.boolean().optional(),
});
