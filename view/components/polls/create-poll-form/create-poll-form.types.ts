import { PERMISSION_KEYS } from '@/constants/server-role.constants';
import { t } from '@/lib/shared.utils';
import { ServerRoleRes } from '@/types/server-role.types';
import { UserRes } from '@/types/user.types';
import { POLL_ACTION_TYPE } from '@common/poll-actions/poll-action.constants';
import * as zod from 'zod';

const PROPOSAL_BODY_MAX = 6000;

export const createPollFormSchema = zod
  .object({
    body: zod
      .string()
      .max(PROPOSAL_BODY_MAX, {
        message: t('polls.errors.longBody'),
      })
      .optional(),
    serverRoleName: zod.string().optional(),
    serverRoleColor: zod.string().optional(),
    action: zod.enum([...POLL_ACTION_TYPE, '']),
    permissions: zod
      .record(zod.enum(PERMISSION_KEYS), zod.boolean().optional())
      .optional(),
    serverRoleMembers: zod.array(zod.string()).optional(),
    selectedServerRoleId: zod.string().optional(),
  })
  .refine(
    (data) => {
      if (data.action === 'test') {
        return !!data.body;
      }
      return true;
    },
    {
      path: ['body'],
      message: t('polls.errors.testProposalRequiresBody'),
    },
  )
  .refine((data) => data.action === 'test' || data.action === 'change-role', {
    message: t('prompts.inDev'),
    path: ['action'],
  });

export type CreatePollFormSchema = zod.infer<typeof createPollFormSchema>;

export interface CreatePollWizardContext {
  selectedServerRole?: ServerRoleRes;
  usersEligibleForServerRole?: UserRes[];
}
