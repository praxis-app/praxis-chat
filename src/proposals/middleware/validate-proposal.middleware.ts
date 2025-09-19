import {
  PROPOSAL_ACTION_TYPE,
  ROLE_ATTRIBUTE_CHANGE_TYPE,
} from '@common/proposal-actions/proposal-action.constants';
import {
  ABILITY_ACTIONS,
  ABILITY_SUBJECTS,
} from '@common/roles/role.constants';
import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';

const proposalActionRoleMemberSchema = zod.object({
  userId: zod.string(),
  changeType: zod.enum(ROLE_ATTRIBUTE_CHANGE_TYPE),
});

const proposalActionPermissionSchema = zod.object({
  subject: zod.enum(ABILITY_SUBJECTS),
  actions: zod.array(
    zod.object({
      action: zod.enum(ABILITY_ACTIONS),
      changeType: zod.enum(ROLE_ATTRIBUTE_CHANGE_TYPE),
    }),
  ),
});

const proposalActionRoleSchema = zod.object({
  name: zod.string().optional(),
  color: zod.string().optional(),
  members: zod.array(proposalActionRoleMemberSchema).optional(),
  permissions: zod.array(proposalActionPermissionSchema).optional(),
  roleToUpdateId: zod.string().optional(),
});

const proposalActionSchema = zod
  .object({
    actionType: zod.enum(PROPOSAL_ACTION_TYPE),
    role: proposalActionRoleSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.actionType === 'change-role') {
        return data.role !== undefined;
      }
      return true;
    },
    {
      message: 'Proposals to change roles must include a role',
    },
  )
  .refine(
    (data) => {
      if (data.actionType === 'change-role') {
        const hasNameChange = data.role?.name !== undefined;
        const hasColorChange = data.role?.color !== undefined;
        const hasMembersChange = !!data.role?.members?.length;
        const hasPermissionsChange = !!data.role?.permissions?.length;

        return (
          hasNameChange ||
          hasColorChange ||
          hasMembersChange ||
          hasPermissionsChange
        );
      }
      return true;
    },
    {
      message: 'Proposals to change roles must include at least 1 change',
    },
  );

const proposalSchema = zod
  .object({
    body: zod.string().optional(),
    action: proposalActionSchema,
    closingAt: zod.date().optional(),
  })
  .refine(
    (data) => {
      if (data.action.actionType === 'test') {
        return !!data.body;
      }
      return true;
    },
    {
      message: 'Test proposals must include a body',
    },
  );

export const validateProposal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    proposalSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof zod.ZodError) {
      const errorMessage =
        error.issues[0]?.message || 'Validation failed for proposal';
      res.status(422).send(errorMessage);
      return;
    }
    res.status(500).send('Internal server error');
  }
};
