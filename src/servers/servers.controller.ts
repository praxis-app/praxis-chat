import { Request, Response } from 'express';
import * as serversService from './servers.service';

export const getServers = async (_req: Request, res: Response) => {
  const servers = await serversService.getServers();
  res.json({ servers });
};

export const getServerById = async (req: Request, res: Response) => {
  const server = await serversService.getServerById(req.params.serverId);
  res.json({ server });
};

export const getServerBySlug = async (req: Request, res: Response) => {
  const server = await serversService.getServerBySlug(req.params.slug);
  res.json({ server });
};

export const getDefaultServer = async (_req: Request, res: Response) => {
  const server = await serversService.getDefaultServer();
  if (!server) {
    res.status(404).json({ error: 'Default server not found' });
    return;
  }
  res.json({ server });
};

export const createServer = async (req: Request, res: Response) => {
  const server = await serversService.createServer(
    req.body.name,
    req.body.slug,
    req.body.description,
    res.locals.user.id,
  );
  res.json({ server });
};

export const updateServer = async (req: Request, res: Response) => {
  const result = await serversService.updateServer(
    req.params.serverId,
    req.body.name,
    req.body.slug,
    req.body.description,
  );
  res.json(result);
};

export const deleteServer = async (req: Request, res: Response) => {
  const result = await serversService.deleteServer(req.params.serverId);
  res.json(result);
};

export const getUsersEligibleForServer = async (
  req: Request,
  res: Response,
) => {
  const users = await serversService.getUsersEligibleForServer(
    req.params.serverId,
  );
  res.json({ users });
};

export const addServerMembers = async (req: Request, res: Response) => {
  const result = await serversService.addServerMembers(
    req.params.serverId,
    req.body.userIds,
  );
  res.json(result);
};

export const removeServerMembers = async (req: Request, res: Response) => {
  const result = await serversService.removeServerMembers(
    req.params.serverId,
    req.body.userIds,
  );
  res.json(result);
};
