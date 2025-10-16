import { Request, Response } from 'express';
import * as serverConfigsService from './server-configs.service';

export const getServerConfig = async (_req: Request, res: Response) => {
  const serverConfig = await serverConfigsService.getServerConfigSafely();
  res.json({ serverConfig });
};

export const updateServerConfig = async (req: Request, res: Response) => {
  const result = await serverConfigsService.updateServerConfig(req.body);
  res.json(result);
};
