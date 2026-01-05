type PermissionLike<Subject extends string, Action extends string> = {
  subject: Subject;
  action: Action;
};

type RoleWithPermissions<Subject extends string, Action extends string> = {
  permissions?: PermissionLike<Subject, Action>[];
};

export const buildPermissionRules = <
  Subject extends string,
  Action extends string,
>(
  roles: RoleWithPermissions<Subject, Action>[],
): { subject: Subject; action: Action[] }[] => {
  const permissionMap = roles.reduce<Record<Subject, Action[]>>(
    (result, role) => {
      for (const permission of role.permissions || []) {
        if (!result[permission.subject]) {
          result[permission.subject] = [];
        }
        result[permission.subject].push(permission.action);
      }
      return result;
    },
    {} as Record<Subject, Action[]>,
  );

  return Object.entries(permissionMap).map(([subject, action]) => ({
    subject: subject as Subject,
    action: action as Action[],
  }));
};
