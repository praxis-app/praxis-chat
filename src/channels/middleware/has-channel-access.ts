import { NextFunction, Request, Response } from 'express';
import * as channelsService from '../channels.service';
import * as instanceService from '../../instance/instance.service';
import { isValidInvite } from '../../invites/invites.service';

export const hasChannelAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const instanceConfig = await instanceService.getInstanceConfigSafely();

  // All channels are public for the default server
  if (instanceConfig.defaultServerId === req.params.serverId) {
    next();
    return;
  }

  // Check if the user is a member of the channel for non-default servers
  const isChannelMember = await channelsService.isChannelMember(
    req.params.channelId,
    res.locals.user.id,
  );

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
};
