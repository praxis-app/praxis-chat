import {
  POLL_ACTION_TYPE,
  ROLE_ATTRIBUTE_CHANGE_TYPE,
} from '@common/poll-actions/poll-action.constants';
import {
  ABILITY_ACTIONS,
  ABILITY_SUBJECTS,
} from '@common/roles/role.constants';
import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';

const pollActionRoleMemberSchema = zod.object({
  userId: zod.string(),
  changeType: zod.enum(ROLE_ATTRIBUTE_CHANGE_TYPE),
});

const pollActionPermissionSchema = zod.object({
  subject: zod.enum(ABILITY_SUBJECTS),
  actions: zod.array(
    zod.object({
      action: zod.enum(ABILITY_ACTIONS),
      changeType: zod.enum(ROLE_ATTRIBUTE_CHANGE_TYPE),
    }),
  ),
});

const pollActionRoleSchema = zod.object({
  name: zod.string().optional(),
  color: zod.string().optional(),
  members: zod.array(pollActionRoleMemberSchema).optional(),
  permissions: zod.array(pollActionPermissionSchema).optional(),
  roleToUpdateId: zod.string().optional(),
});

const pollActionSchema = zod
  .object({
    actionType: zod.enum(POLL_ACTION_TYPE),
    role: pollActionRoleSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.actionType === 'change-role') {
        return data.role !== undefined;
      }
      return true;
    },
    {
      message: 'Polls to change roles must include a role',
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
      message: 'Polls to change roles must include at least 1 change',
    },
  );

const pollSchema = zod
  .object({
    body: zod.string().optional(),
    action: pollActionSchema,
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
      message: 'Test polls must include a body',
    },
  );

export const validatePoll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    pollSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof zod.ZodError) {
      const errorMessage =
        error.issues[0]?.message || 'Validation failed for poll';
      res.status(422).send(errorMessage);
      return;
    }
    res.status(500).send('Internal server error');
  }
};
