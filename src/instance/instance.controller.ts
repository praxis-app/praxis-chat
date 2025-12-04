import { Request, Response } from 'express';
import * as instanceService from './instance.service';

export const getInstanceConfig = async (_req: Request, res: Response) => {
  const instanceConfig = await instanceService.getInstanceConfigSafely();
  res.json({ instanceConfig });
};

export const updateInstanceConfig = async (req: Request, res: Response) => {
  const instanceConfig = await instanceService.updateInstanceConfig(req.body);
  res.json({ instanceConfig });
};
