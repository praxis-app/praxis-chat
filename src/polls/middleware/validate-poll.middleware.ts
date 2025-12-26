import {
  POLL_ACTION_TYPE,
  ROLE_ATTRIBUTE_CHANGE_TYPE,
} from '@common/poll-actions/poll-action.constants';
import {
  SERVER_ABILITY_ACTIONS,
  SERVER_ABILITY_SUBJECTS,
} from '@common/roles/server-roles/server-role.constants';
import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';
import { PollDto } from '../dtos/poll.dto';

const pollActionRoleMemberSchema = zod.object({
  userId: zod.string(),
  changeType: zod.enum(ROLE_ATTRIBUTE_CHANGE_TYPE),
});

const pollActionPermissionSchema = zod.object({
  subject: zod.enum(SERVER_ABILITY_SUBJECTS),
  actions: zod.array(
    zod.object({
      action: zod.enum(SERVER_ABILITY_ACTIONS),
      changeType: zod.enum(ROLE_ATTRIBUTE_CHANGE_TYPE),
    }),
  ),
});

const pollActionRoleSchema = zod.object({
  name: zod.string().optional(),
  color: zod.string().optional(),
  members: zod.array(pollActionRoleMemberSchema).optional(),
  permissions: zod.array(pollActionPermissionSchema).optional(),
  serverRoleToUpdateId: zod.string().optional(),
});

const pollActionSchema = zod
  .object({
    actionType: zod.enum(POLL_ACTION_TYPE),
    serverRole: pollActionRoleSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.actionType === 'change-role') {
        return data.serverRole !== undefined;
      }
      return true;
    },
    {
      message: 'Polls to change server roles must include a server role',
    },
  )
  .refine(
    (data) => {
      if (data.actionType === 'change-role') {
        const hasNameChange = data.serverRole?.name !== undefined;
        const hasColorChange = data.serverRole?.color !== undefined;
        const hasMembersChange = !!data.serverRole?.members?.length;
        const hasPermissionsChange = !!data.serverRole?.permissions?.length;

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
      message: 'Polls to change server roles must include at least 1 change',
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
    const body = req.body as PollDto;

    // Validate request body shape
    pollSchema.parse(body);

    // Check if user is registered for non-test proposals
    if (body.action.actionType !== 'test' && res.locals.user.anonymous) {
      res
        .status(403)
        .send('Only registered users can create non-test proposals');
      return;
    }

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
