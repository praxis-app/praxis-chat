/**
 * TODO: Ensure `can` middleware is able to account for both server roles
 * and instance roles once they're implemented. This middleware should
 * likely be moved to a more generic location and updated to support
 * both types of roles at that point.
 */

import { createMongoAbility, ForbiddenError } from '@casl/ability';
import {
  ServerAbilityAction,
  ServerAbilitySubject,
  ServerAbility,
} from '@common/roles/server-ability';
import { NextFunction, Request, Response } from 'express';

export const can =
  (
    action: ServerAbilityAction | ServerAbilityAction[],
    subject: ServerAbilitySubject,
  ) =>
  (_req: Request, res: Response, next: NextFunction) => {
    const actions = Array.isArray(action) ? action : [action];
    const permissions = res.locals.user?.permissions || [];
    const currentUserAbility = createMongoAbility<ServerAbility>(permissions);

    if (currentUserAbility.can('manage', subject)) {
      return next();
    }

    for (const action of actions) {
      ForbiddenError.from(currentUserAbility).throwUnlessCan(action, subject);
    }

    next();
  };
