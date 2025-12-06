import { Request, Response } from 'express';
import * as instanceRolesService from './instance-roles.service';

export const getInstanceRole = async (req: Request, res: Response) => {
  const instanceRole = await instanceRolesService.getInstanceRole(
    req.params.instanceRoleId,
  );
  res.json({ instanceRole });
};

export const getInstanceRoles = async (_req: Request, res: Response) => {
  const instanceRoles = await instanceRolesService.getInstanceRoles();
  res.json({ instanceRoles });
};

export const getUsersEligibleForInstanceRole = async (
  req: Request,
  res: Response,
) => {
  const users = await instanceRolesService.getUsersEligibleForInstanceRole(
    req.params.instanceRoleId,
  );
  res.json({ users });
};

export const createInstanceRole = async (req: Request, res: Response) => {
  const instanceRole = await instanceRolesService.createInstanceRole(req.body);
  res.json({ instanceRole });
};

export const updateInstanceRole = async (req: Request, res: Response) => {
  const result = await instanceRolesService.updateInstanceRole(
    req.params.instanceRoleId,
    req.body,
  );
  res.json(result);
};

export const updateInstanceRolePermissions = async (
  req: Request,
  res: Response,
) => {
  await instanceRolesService.updateInstanceRolePermissions(
    req.params.instanceRoleId,
    req.body,
  );
  res.sendStatus(204);
};

export const addInstanceRoleMembers = async (req: Request, res: Response) => {
  await instanceRolesService.addInstanceRoleMembers(
    req.params.instanceRoleId,
    req.body.userIds,
  );
  res.sendStatus(204);
};

export const removeInstanceRoleMember = async (req: Request, res: Response) => {
  await instanceRolesService.removeInstanceRoleMembers(
    req.params.instanceRoleId,
    [req.params.userId],
  );
  res.sendStatus(204);
};

export const deleteInstanceRole = async (req: Request, res: Response) => {
  const result = await instanceRolesService.deleteInstanceRole(
    req.params.instanceRoleId,
  );
  res.json(result);
};
