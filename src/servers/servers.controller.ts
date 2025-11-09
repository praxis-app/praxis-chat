import * as serversService from './servers.service';
import { Request, Response } from 'express';

export const getServers = async (_req: Request, res: Response) => {
  const servers = await serversService.getServers();
  res.json({ servers });
};

export const getServerBySlug = async (req: Request, res: Response) => {
  const server = await serversService.getServerBySlug(req.params.slug);
  res.json({ server });
};
