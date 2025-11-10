/**
 * TODO: Ensure `can` middleware is able to account for both server roles
 * and instance roles once they're implemented. This middleware should
 * likely be moved to a more generic location and updated to support
 * both types of roles at that point.
 */

import {
  createMongoAbility,
  ForbiddenError,
  ForcedSubject,
  MongoAbility,
  RawRuleOf,
} from '@casl/ability';
import {
  ServerAbilityAction,
  ServerAbilitySubject,
} from '@common/server-roles/server-ability';
import { NextFunction, Request, Response } from 'express';
import {
  InstanceAbilityAction,
  InstanceAbilitySubject,
} from '@common/instance-roles/instance-ability';

type RoleAbilityAction = ServerAbilityAction | InstanceAbilityAction;
type RoleAbilitySubject = ServerAbilitySubject | InstanceAbilitySubject;

type RoleAbilities = [
  RoleAbilityAction,
  RoleAbilitySubject | ForcedSubject<Exclude<RoleAbilitySubject, 'all'>>,
];

type RoleAbility = MongoAbility<RoleAbilities>;

export const can =
  (
    action: RoleAbilityAction | RoleAbilityAction[],
    subject: RoleAbilitySubject,
  ) =>
  (_req: Request, res: Response, next: NextFunction) => {
    const actions = Array.isArray(action) ? action : [action];
    const permissions =
      (res.locals.user?.permissions as RawRuleOf<RoleAbility>[] | undefined) ||
      [];
    const currentUserAbility = createMongoAbility<RoleAbility>(permissions);

    if (currentUserAbility.can('manage', subject)) {
      return next();
    }

    for (const action of actions) {
      ForbiddenError.from(currentUserAbility).throwUnlessCan(action, subject);
    }

    next();
  };
