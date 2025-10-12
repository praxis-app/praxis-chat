import { PERMISSION_KEYS } from '@/constants/role.constants';
import { t } from '@/lib/shared.utils';
import { RoleRes } from '@/types/role.types';
import { UserRes } from '@/types/user.types';
import { POLL_ACTION_TYPE } from '@common/poll-actions/poll-action.constants';
import * as zod from 'zod';

const PROPOSAL_BODY_MAX = 6000;

export const createProposalFormSchema = zod
  .object({
    body: zod
      .string()
      .max(PROPOSAL_BODY_MAX, {
        message: t('proposals.errors.longBody'),
      })
      .optional(),
    roleName: zod.string().optional(),
    roleColor: zod.string().optional(),
    action: zod.enum([...POLL_ACTION_TYPE, '']),
    permissions: zod
      .record(zod.enum(PERMISSION_KEYS), zod.boolean().optional())
      .optional(),
    roleMembers: zod.array(zod.string()).optional(),
    selectedRoleId: zod.string().optional(),
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
      message: t('proposals.errors.testProposalRequiresBody'),
    },
  )
  .refine((data) => data.action === 'test' || data.action === 'change-role', {
    message: t('prompts.inDev'),
    path: ['action'],
  });

export type CreateProposalFormSchema = zod.infer<
  typeof createProposalFormSchema
>;

export interface CreateProposalWizardContext {
  selectedRole?: RoleRes;
  usersEligibleForRole?: UserRes[];
}
