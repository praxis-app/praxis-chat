import { Request, Response } from 'express';
import * as rolesService from './roles.service';

export const getRole = async (req: Request, res: Response) => {
  const role = await rolesService.getRole(req.params.roleId);
  res.json({ role });
};

export const getRoles = async (_req: Request, res: Response) => {
  const roles = await rolesService.getRoles();
  res.json({ roles });
};

export const getUsersEligibleForRole = async (req: Request, res: Response) => {
  const users = await rolesService.getUsersEligibleForRole(req.params.roleId);
  res.json({ users });
};

export const createRole = async (req: Request, res: Response) => {
  const role = await rolesService.createRole(req.body);
  res.json({ role });
};

export const updateRole = async (req: Request, res: Response) => {
  const result = await rolesService.updateRole(req.params.roleId, req.body);
  res.json(result);
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  await rolesService.updateRolePermissions(req.params.roleId, req.body);
  res.sendStatus(204);
};

export const addRoleMembers = async (req: Request, res: Response) => {
  await rolesService.addRoleMembers(req.params.roleId, req.body.userIds);
  res.sendStatus(204);
};

export const removeRoleMember = async (req: Request, res: Response) => {
  await rolesService.removeRoleMembers(req.params.roleId, [req.params.userId]);
  res.sendStatus(204);
};

export const deleteRole = async (req: Request, res: Response) => {
  const result = await rolesService.deleteRole(req.params.roleId);
  res.json(result);
};
