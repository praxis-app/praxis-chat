import { Request, Response } from 'express';
import * as serverRolesService from './server-roles.service';

export const getServerRole = async (req: Request, res: Response) => {
  const serverRole = await serverRolesService.getServerRole(
    req.params.serverId,
    req.params.serverRoleId,
  );
  res.json({ serverRole });
};

export const getServerRoles = async (req: Request, res: Response) => {
  const serverRoles = await serverRolesService.getServerRoles(
    req.params.serverId,
  );
  res.json({ serverRoles });
};

export const getUsersEligibleForServerRole = async (
  req: Request,
  res: Response,
) => {
  const users = await serverRolesService.getUsersEligibleForServerRole(
    req.params.serverId,
    req.params.serverRoleId,
  );
  res.json({ users });
};

export const createServerRole = async (req: Request, res: Response) => {
  const serverRole = await serverRolesService.createServerRole(
    req.params.serverId,
    req.body,
  );
  res.json({ serverRole });
};

export const updateServerRole = async (req: Request, res: Response) => {
  const result = await serverRolesService.updateServerRole(
    req.params.serverId,
    req.params.serverRoleId,
    req.body,
  );
  res.json(result);
};

export const updateServerRolePermissions = async (
  req: Request,
  res: Response,
) => {
  await serverRolesService.updateServerRolePermissions(
    req.params.serverId,
    req.params.serverRoleId,
    req.body,
  );
  res.sendStatus(204);
};

export const addServerRoleMembers = async (req: Request, res: Response) => {
  await serverRolesService.addServerRoleMembers(
    req.params.serverId,
    req.params.serverRoleId,
    req.body.userIds,
  );
  res.sendStatus(204);
};

export const removeServerRoleMember = async (req: Request, res: Response) => {
  await serverRolesService.removeServerRoleMembers(
    req.params.serverId,
    req.params.serverRoleId,
    [req.params.userId],
  );
  res.sendStatus(204);
};

export const deleteServerRole = async (req: Request, res: Response) => {
  const result = await serverRolesService.deleteServerRole(
    req.params.serverId,
    req.params.serverRoleId,
  );
  res.json(result);
};
