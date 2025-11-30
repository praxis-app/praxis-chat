/**
 * TODO: Ensure `can` middleware is able to account for both server roles
 * and instance roles once they're implemented. This middleware should
 * likely be moved to a more generic location and updated to support
 * both types of roles at that point.
 *
 * TODO: Test fully before merging
 */

import {
  createMongoAbility,
  ForbiddenError,
  ForcedSubject,
  MongoAbility,
} from '@casl/ability';
import {
  InstanceAbilityAction,
  InstanceAbilitySubject,
} from '@common/instance-roles/instance-ability';
import {
  ServerAbilityAction,
  ServerAbilitySubject,
} from '@common/server-roles/server-ability';
import { NextFunction, Request, Response } from 'express';

type RoleAbilityAction = ServerAbilityAction | InstanceAbilityAction;
type RoleAbilitySubject = ServerAbilitySubject | InstanceAbilitySubject;

type RoleAbilities = [
  RoleAbilityAction,
  RoleAbilitySubject | ForcedSubject<Exclude<RoleAbilitySubject, 'all'>>,
];

export const can =
  (
    action: RoleAbilityAction | RoleAbilityAction[],
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
