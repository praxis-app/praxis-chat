import { Request, Response } from 'express';
import * as serverConfigsService from './server-configs.service';

export const getServerConfig = async (req: Request, res: Response) => {
  const serverConfig = await serverConfigsService.getServerConfig(
    req.params.serverId,
  );
  if (!serverConfig) {
    res.status(404).send('Server config not found');
    return;
  }
  res.json({ serverConfig });
};

export const isAnonymousUsersEnabled = async (req: Request, res: Response) => {
  const anonymousUsersEnabled =
    await serverConfigsService.isAnonymousUsersEnabled(req.params.serverId);

  if (anonymousUsersEnabled === null) {
    res.status(404).send('Server config not found');
    return;
  }
  res.json({ anonymousUsersEnabled });
};

export const updateServerConfig = async (req: Request, res: Response) => {
  const result = await serverConfigsService.updateServerConfig(
    req.params.serverId,
    req.body,
  );
  res.json(result);
};
