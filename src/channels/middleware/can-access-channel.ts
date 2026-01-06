import { NextFunction, Request, Response } from 'express';
import { authenticateOptional } from '../../auth/middleware/authenticate-optional.middleware';
import { withMiddleware } from '../../common/middleware.utils';
import * as instanceService from '../../instance/instance.service';
import * as invitesService from '../../invites/invites.service';
import { User } from '../../users/user.entity';
import * as channelsService from '../channels.service';

/**
 * Check if the user has access to a single channel
 */
export const canAccessChannel = withMiddleware(
  authenticateOptional,
  async (req: Request, res: Response, next: NextFunction) => {
    const user: User | undefined = res.locals.user;

    // All channels are public for the default server
    const instanceConfig = await instanceService.getInstanceConfigSafely();
    if (instanceConfig.defaultServerId === req.params.serverId) {
      next();
      return;
    }

    // Check if the user is a member of this channel (for non-default servers)
    const isChannelMember = user
      ? await channelsService.isChannelMember(
          req.params.serverId,
          req.params.channelId,
          user.id,
        )
      : false;
    if (isChannelMember) {
      next();
      return;
    }

    // Check if the user has been invited to the server for this channel
    if (!req.query.inviteToken || typeof req.query.inviteToken !== 'string') {
      res.status(403).send('Forbidden');
      return;
    }
    const isValid = await invitesService.isValidInvite({
      token: req.query.inviteToken,
      serverId: req.params.serverId,
    });
    if (!isValid) {
      res.status(403).send('Forbidden');
      return;
    }

    next();
  },
);
