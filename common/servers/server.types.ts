import * as zod from 'zod';
import { ServerErrorKeys } from './server.constants';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const serverFormSchema = zod.object({
  name: zod
    .string()
    .trim()
    .min(2, { message: ServerErrorKeys.NameLength })
    .max(20, { message: ServerErrorKeys.NameLength }),
  slug: zod
    .string()
    .trim()
    .min(2, { message: ServerErrorKeys.SlugLength })
    .max(20, { message: ServerErrorKeys.SlugLength })
    .regex(slugPattern, { message: ServerErrorKeys.SlugInvalid }),
  description: zod
    .string()
    .trim()
    .min(1, { message: ServerErrorKeys.DescriptionLength })
    .max(255, { message: ServerErrorKeys.DescriptionLength }),
});
