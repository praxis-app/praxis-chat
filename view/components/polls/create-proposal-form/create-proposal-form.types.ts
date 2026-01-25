import { SERVER_PERMISSION_KEYS } from '@/constants/role.constants';
import { t } from '@/lib/shared.utils';
import { ServerRoleRes } from '@/types/role.types';
import { UserRes } from '@/types/user.types';
import { POLL_ACTION_TYPE } from '@common/poll-actions/poll-action.constants';
import { POLL_BODY_MAX } from '@common/polls/poll.constants';
import * as zod from 'zod';

export const createProposalFormSchema = zod
  .object({
    body: zod
      .string()
      .max(POLL_BODY_MAX, {
        message: t('polls.errors.longBody'),
      })
      .optional(),
    serverRoleName: zod.string().optional(),
    serverRoleColor: zod.string().optional(),
    action: zod.enum([...POLL_ACTION_TYPE, '']),
    permissions: zod
      .record(zod.enum(SERVER_PERMISSION_KEYS), zod.boolean().optional())
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
  .refine(
    (data) => {
      if (data.action === 'general') {
        return !!data.body;
      }
      return true;
    },
    {
      path: ['body'],
      message: t('polls.errors.generalProposalRequiresBody'),
    },
  )
  .refine(
    (data) =>
      data.action === 'general' ||
      data.action === 'change-role' ||
      data.action === 'test',
    {
      message: t('prompts.inDev'),
      path: ['action'],
    },
  );

export type CreateProposalFormSchema = zod.infer<typeof createProposalFormSchema>;

export interface CreateProposalWizardContext {
  selectedServerRole?: ServerRoleRes;
  usersEligibleForServerRole?: UserRes[];
}
