import {
  createMongoAbility,
  ForbiddenError,
  ForcedSubject,
  MongoAbility,
} from '@casl/ability';
import { InstanceAbilitySubject } from '@common/roles/instance-roles/instance-ability';
import { AppAbilityAction } from '@common/roles/role.types';
import { ServerAbilitySubject } from '@common/roles/server-roles/server-ability';
import { NextFunction, Request, Response } from 'express';

type RoleAbilitySubject = ServerAbilitySubject | InstanceAbilitySubject;

type RoleAbilities = [
  AppAbilityAction,
  RoleAbilitySubject | ForcedSubject<Exclude<RoleAbilitySubject, 'all'>>,
];

export const can =
  (
    action: AppAbilityAction | AppAbilityAction[],
    subject: RoleAbilitySubject,
    scope: 'instance' | 'server' = 'server',
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    const actions = Array.isArray(action) ? action : [action];
    const permissions = res.locals.user?.permissions || {};

    if (scope === 'instance') {
      const instanceAbility = createMongoAbility<MongoAbility<RoleAbilities>>(
        permissions.instance,
      );

      if (!instanceAbility.can('manage', subject)) {
        for (const currentAction of actions) {
          ForbiddenError.from(instanceAbility).throwUnlessCan(
            currentAction,
            subject,
          );
        }
      }
      next();
      return;
    }

    const serverId =
      req.params?.serverId || req.body?.serverId || req.query?.serverId;

    const serverAbility = createMongoAbility<MongoAbility<RoleAbilities>>(
      permissions.servers?.[serverId] || [],
    );

    if (!serverAbility.can('manage', subject)) {
      for (const currentAction of actions) {
        ForbiddenError.from(serverAbility).throwUnlessCan(
          currentAction,
          subject,
        );
      }
    }

    next();
  };
