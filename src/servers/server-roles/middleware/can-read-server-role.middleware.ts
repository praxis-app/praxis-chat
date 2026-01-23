import { NextFunction, Request, Response } from 'express';
import { dataSource } from '../../../database/data-source';
import * as instanceService from '../../../instance/instance.service';
import * as invitesService from '../../../invites/invites.service';
import * as serversService from '../../../servers/servers.service';
import { User } from '../../../users/user.entity';
import { ServerRole } from '../entities/server-role.entity';

const serverRoleRepository = dataSource.getRepository(ServerRole);

export const canReadServerRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUser: User | undefined = res.locals.user;
  const { serverId, serverRoleId } = req.params;
  const { inviteToken } = req.query;

  // Check if the server role exists and belongs to the server
  const exists = await serverRoleRepository.exists({
    where: { id: serverRoleId, serverId },
  });
  if (!exists) {
    res.status(404).send('Server role not found');
    return;
  }

  if (!currentUser) {
    // Check if the server role is in a public (default / demo) server
    const instanceConfig = await instanceService.getInstanceConfigSafely();
    const isPublicServerRole = instanceConfig.defaultServerId === serverId;
    if (isPublicServerRole) {
      next();
      return;
    }

    // Check if the user has been invited to the server for this server role
    if (inviteToken && typeof inviteToken === 'string') {
      const isValid = await invitesService.isValidInvite({
        token: inviteToken,
        serverId: req.params.serverId,
      });
      if (isValid) {
        next();
        return;
      }
    }

    res.status(403).send('Forbidden');
    return;
  }

  // Check if the current user is a member of the server
  const isServerMember = await serversService.isServerMember(
    serverId,
    currentUser.id,
  );
  if (!isServerMember) {
    res.status(403).send('Forbidden');
    return;
  }

  next();
};
