import { Request, Response } from 'express';
import * as instanceService from './instance.service';

export const getInstanceConfig = async (_req: Request, res: Response) => {
  const instanceConfig = await instanceService.getInstanceConfigSafely();
  res.json({ instanceConfig });
};

export const updateDefaultServer = async (req: Request, res: Response) => {
  const result = await instanceService.updateDefaultServer(
    req.body.defaultServerId,
  );
  res.json(result);
};
