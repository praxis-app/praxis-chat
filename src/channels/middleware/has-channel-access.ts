import { NextFunction, Request, Response } from 'express';
import { authenticateOptional } from '../../auth/middleware/authenticate-optional.middleware';
import { withMiddleware } from '../../common/middleware.utils';
import * as instanceService from '../../instance/instance.service';
import { isValidInvite } from '../../invites/invites.service';
import { User } from '../../users/user.entity';
import * as channelsService from '../channels.service';

/**
 * Check if the user has access to a single channel
 */
export const hasChannelAccess = withMiddleware(
  authenticateOptional,
  async (req: Request, res: Response, next: NextFunction) => {
    const user: User | undefined = res.locals.user;

    const instanceConfig = await instanceService.getInstanceConfigSafely();

    // All channels are public for the default server
    if (instanceConfig.defaultServerId === req.params.serverId) {
      next();
      return;
    }

    // Check if the user is a member of this channel (for non-default servers)
    const isChannelMember = user
      ? await channelsService.isChannelMember(req.params.channelId, user.id)
      : false;

    // TODO: Clean up the following logic - can likely be flattened a bit more

    if (!isChannelMember) {
      // Check if the user has been invited to the server for this channel
      if (req.query.inviteToken && typeof req.query.inviteToken === 'string') {
        const isValid = await isValidInvite({
          token: req.query.inviteToken,
          serverId: req.params.serverId,
        });
        if (isValid) {
          next();
          return;
        }
      }

      /**
       * If the channel isn't public, the user isn't a member of the channel, and
       * the user isn't invited to the server for this channel, prevent access
       */
      res.status(403).send('Forbidden');
      return;
    }

    next();
  },
);
