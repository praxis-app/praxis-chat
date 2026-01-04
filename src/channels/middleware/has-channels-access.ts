import { NextFunction, Request, Response } from 'express';
import { authenticateOptional } from '../../auth/middleware/authenticate-optional.middleware';
import { withMiddleware } from '../../common/middleware.utils';
import * as instanceService from '../../instance/instance.service';
import { isValidInvite } from '../../invites/invites.service';
import * as serversService from '../../servers/servers.service';

/**
 * Check if the user has access to all channels for a given server
 */
export const hasChannelsAccess = withMiddleware(
  authenticateOptional,
  async (req: Request, res: Response, next: NextFunction) => {
    const instanceConfig = await instanceService.getInstanceConfigSafely();

    // Grant access to server members
    if (res.locals.user) {
      const isServerMember = await serversService.isServerMember(
        req.params.serverId,
        res.locals.user.id,
      );
      if (isServerMember) {
        next();
        return;
      }
    }

    // All channels are public for the default server
    if (instanceConfig.defaultServerId === req.params.serverId) {
      next();
      return;
    }

    // Check if the user has been invited to the server
    if (!req.query.inviteToken || typeof req.query.inviteToken !== 'string') {
      res.status(403).send('Forbidden');
      return;
    } else {
      const isValid = await isValidInvite({
        token: req.query.inviteToken,
        serverId: req.params.serverId,
      });
      if (!isValid) {
        res.status(403).send('Forbidden');
        return;
      }
    }

    next();
  },
);
