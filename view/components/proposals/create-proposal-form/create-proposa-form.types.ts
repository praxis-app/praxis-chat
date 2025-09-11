import { PROPOSAL_ACTION_TYPE } from '@/constants/proposal.constants';
import { PERMISSION_KEYS } from '@/constants/role.constants';
import { t } from '@/lib/shared.utils';
import * as zod from 'zod';

const PROPOSAL_BODY_MAX = 6000;

export const createProposalFormSchema = zod.object({
  body: zod
    .string()
    .max(PROPOSAL_BODY_MAX, {
      message: t('proposals.errors.longBody'),
    })
    .optional(),
  action: zod.enum([...PROPOSAL_ACTION_TYPE, '']),
  permissions: zod.record(zod.enum(PERMISSION_KEYS), zod.boolean()).optional(),
  roleMembers: zod
    .array(
      zod.object({
        userId: zod.string(),
        changeType: zod.enum(['add', 'remove']),
      }),
    )
    .optional(),
  selectedRoleId: zod.string().optional(),
});

export type CreateProposalFormSchema = zod.infer<
  typeof createProposalFormSchema
>;
