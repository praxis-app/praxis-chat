import { WizardStepProps } from '@/components/shared/wizard/wizard.types';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { getPermissionValuesMap } from '@/lib/role.utils';
import { PermissionKeys } from '@/types/role.types';
import { UserRes } from '@/types/user.types';
import {
  PollActionType,
  RoleAttributeChangeType,
} from '@common/poll-actions/poll-action.types';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '../../../shared/wizard/wizard-hooks';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import {
  CreatePollFormSchema,
  CreatePollWizardContext,
} from '../create-poll-form.types';

export const PollReviewStep = ({ isLoading }: WizardStepProps) => {
  const {
    context: { selectedRole, usersEligibleForRole },
    onSubmit,
    onPrevious,
    isSubmitting,
  } = useWizardContext<CreatePollWizardContext>();

  const form = useFormContext<CreatePollFormSchema>();

  const formValues = form.getValues();
  const { action, body, permissions, roleMembers, roleName, roleColor } =
    formValues;

  const nameChanged = roleName !== selectedRole?.name;
  const colorChanged = roleColor !== selectedRole?.color;

  const shapedRolePermissions = getPermissionValuesMap(
    selectedRole?.permissions || [],
  );

  const permissionChanges = Object.entries(permissions || {}).reduce<
    Record<string, boolean>
  >((result, [permission, value]) => {
    if (value !== undefined && value !== shapedRolePermissions[permission]) {
      result[permission] = value;
    }
    return result;
  }, {});

  const memberChanges = (() => {
    const changes: { user: UserRes; changeType: RoleAttributeChangeType }[] =
      [];
    for (const user of selectedRole?.members || []) {
      if (!roleMembers?.includes(user.id)) {
        changes.push({ user, changeType: 'remove' });
      }
    }
    for (const user of usersEligibleForRole || []) {
      if (roleMembers?.includes(user.id)) {
        changes.push({ user, changeType: 'add' });
      }
    }
    return changes;
  })();

  const { t } = useTranslation();

  const getPollActionLabel = (action: PollActionType | '') => {
    if (action === 'change-role') {
      return t('polls.actionTypes.changeRole');
    }
    if (action === 'change-settings') {
      return t('polls.actionTypes.changeSettings');
    }
    if (action === 'create-role') {
      return t('polls.actionTypes.createRole');
    }
    if (action === 'plan-event') {
      return t('polls.actionTypes.planEvent');
    }
    if (action === 'test') {
      return t('polls.actionTypes.test');
    }
    return '';
  };

  const getPermissionName = (name: PermissionKeys | '') => {
    if (!name) {
      return '';
    }
    return t(`permissions.names.${name}`);
  };

  const handleSubmitBtnClick = () => {
    if (
      !nameChanged &&
      !colorChanged &&
      !memberChanges.length &&
      !Object.keys(permissionChanges).length
    ) {
      form.setError('root', {
        message: t('polls.errors.changeRoleRequiresChanges'),
      });
      return;
    }
    onSubmit();
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground text-sm">
        {t('actions.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t('polls.headers.review')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('polls.descriptions.reviewDescription')}
        </p>
      </div>

      <div className="space-y-4">
        {body && (
          <Card className="gap-3 py-5">
            <CardHeader>
              <CardTitle className="text-base">
                {t('polls.labels.body')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{body}</p>
            </CardContent>
          </Card>
        )}

        <Card className="gap-3 py-5">
          <CardHeader>
            <CardTitle className="text-base">
              {t('polls.labels.actionType')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{getPollActionLabel(action)}</p>
          </CardContent>
        </Card>

        {action === 'change-role' && selectedRole && (
          <Card className="gap-3 py-5">
            <CardHeader>
              <CardTitle className="text-base">
                {t('polls.headers.selectedRole')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: selectedRole.color }}
                />
                <span className="font-medium">{selectedRole.name}</span>
                <span className="text-muted-foreground text-sm">
                  {MIDDOT_WITH_SPACES}
                </span>
                <p className="text-muted-foreground text-sm">
                  {t('roles.labels.membersCount', {
                    count: selectedRole.memberCount,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {action === 'change-role' &&
          selectedRole &&
          (nameChanged || colorChanged) && (
            <Card className="gap-3 py-5">
              <CardHeader>
                <CardTitle className="text-base">
                  {t('polls.headers.roleAttributesChanges')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nameChanged && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">
                        {t('polls.labels.roleNameChange')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground text-sm">
                          {selectedRole.name}
                        </span>
                        <span className="text-sm">→</span>
                        <span className="text-sm font-medium">{roleName}</span>
                      </div>
                    </div>
                  )}
                  {colorChanged && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">
                        {t('polls.labels.roleColorChange')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: selectedRole.color }}
                        />
                        <span className="text-muted-foreground text-sm">
                          {selectedRole.color}
                        </span>
                        <span className="text-sm">→</span>
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: roleColor }}
                        />
                        <span className="text-sm font-medium">{roleColor}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {action === 'change-role' &&
          Object.keys(permissionChanges).length > 0 && (
            <Card className="gap-3 py-5">
              <CardHeader>
                <CardTitle className="text-base">
                  {t('polls.headers.permissions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(permissionChanges).map(
                    ([permissionName, permissionValue]) => (
                      <div
                        key={permissionName}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          {getPermissionName(permissionName as PermissionKeys)}
                        </span>
                        <Badge
                          variant={permissionValue ? 'default' : 'destructive'}
                          className="w-17"
                        >
                          {permissionValue
                            ? t('actions.enabled')
                            : t('actions.disabled')}
                        </Badge>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {action === 'change-role' && memberChanges.length > 0 && (
          <Card className="gap-3 py-5">
            <CardHeader>
              <CardTitle className="text-base">
                {t('polls.headers.memberChanges')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {memberChanges.map((member) => (
                  <div
                    key={member.user.id}
                    className="flex items-center justify-between"
                  >
                    <span className="max-w-[150px] truncate text-sm md:max-w-[220px]">
                      {member.user.displayName || member.user.name}
                    </span>
                    <Badge
                      variant={
                        member.changeType === 'add' ? 'default' : 'destructive'
                      }
                      className="w-16"
                    >
                      {member.changeType === 'add'
                        ? t('actions.add')
                        : t('actions.remove')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {form.formState.errors.root && (
        <p className="text-destructive text-sm">
          {form.formState.errors.root.message}
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          {t('actions.previous')}
        </Button>
        <Button onClick={handleSubmitBtnClick} disabled={isSubmitting}>
          {t('polls.actions.create')}
        </Button>
      </div>
    </div>
  );
};
