import { createMongoAbility, ForbiddenError } from '@casl/ability';
import {
  AbilityAction,
  AbilitySubject,
  AppAbility,
} from '@common/roles/app-ability';
import { NextFunction, Request, Response } from 'express';

export const can =
  (action: AbilityAction | AbilityAction[], subject: AbilitySubject) =>
  (_req: Request, res: Response, next: NextFunction) => {
    const actions = Array.isArray(action) ? action : [action];
    const permissions = res.locals.user?.permissions || [];
    const currentUserAbility = createMongoAbility<AppAbility>(permissions);

    if (currentUserAbility.can('manage', subject)) {
      return next();
    }

    for (const action of actions) {
      ForbiddenError.from(currentUserAbility).throwUnlessCan(action, subject);
    }

    next();
  };
