import { WizardStepProps } from '@/components/shared/wizard/wizard.types';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { getServerPermissionValuesMap } from '@/lib/role.utils';
import { ServerPermissionKeys } from '@/types/role.types';
import { UserRes } from '@/types/user.types';
import {
  PollActionType,
  RoleAttributeChangeType,
} from '@common/poll-actions/poll-action.types';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '../../../../shared/wizard/wizard-hooks';
import { Badge } from '../../../../ui/badge';
import { Button } from '../../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../ui/card';
import {
  CreateProposalFormSchema,
  CreateProposalWizardContext,
} from '../create-proposal-form.types';

export const ProposalReviewStep = ({ isLoading }: WizardStepProps) => {
  const {
    context: { selectedServerRole, usersEligibleForServerRole },
    onSubmit,
    onPrevious,
    isSubmitting,
  } = useWizardContext<CreateProposalWizardContext>();

  const form = useFormContext<CreateProposalFormSchema>();

  const formValues = form.getValues();
  const {
    action,
    body,
    permissions,
    serverRoleMembers,
    serverRoleName,
    serverRoleColor,
  } = formValues;

  const nameChanged = serverRoleName !== selectedServerRole?.name;
  const colorChanged = serverRoleColor !== selectedServerRole?.color;

  const shapedRolePermissions = getServerPermissionValuesMap(
    selectedServerRole?.permissions || [],
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
    for (const user of selectedServerRole?.members || []) {
      if (!serverRoleMembers?.includes(user.id)) {
        changes.push({ user, changeType: 'remove' });
      }
    }
    for (const user of usersEligibleForServerRole || []) {
      if (serverRoleMembers?.includes(user.id)) {
        changes.push({ user, changeType: 'add' });
      }
    }
    return changes;
  })();

  const { t } = useTranslation();

  const getProposalActionLabel = (action: PollActionType | '') => {
    if (action === 'general') {
      return t('proposals.actionTypes.general');
    }
    if (action === 'change-role') {
      return t('proposals.actionTypes.changeRole');
    }
    if (action === 'change-settings') {
      return t('proposals.actionTypes.changeSettings');
    }
    if (action === 'create-role') {
      return t('proposals.actionTypes.createRole');
    }
    if (action === 'plan-event') {
      return t('proposals.actionTypes.planEvent');
    }
    if (action === 'test') {
      return t('proposals.actionTypes.test');
    }
    return '';
  };

  const getPermissionName = (name: ServerPermissionKeys | '') => {
    if (!name) {
      return '';
    }
    return t(`permissions.names.${name}`);
  };

  const handleSubmitBtnClick = () => {
    if (action === 'change-role') {
      if (
        !nameChanged &&
        !colorChanged &&
        !memberChanges.length &&
        !Object.keys(permissionChanges).length
      ) {
        form.setError('root', {
          message: t('proposals.errors.changeRoleRequiresChanges'),
        });
        return;
      }
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
        <h2 className="text-lg font-semibold">
          {t('proposals.headers.review')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.descriptions.reviewDescription')}
        </p>
      </div>

      <div className="space-y-4">
        {body && (
          <Card className="gap-3 py-5">
            <CardHeader>
              <CardTitle className="text-base">
                {t('proposals.labels.body')}
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
              {t('proposals.labels.actionType')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{getProposalActionLabel(action)}</p>
          </CardContent>
        </Card>

        {action === 'change-role' && selectedServerRole && (
          <Card className="gap-3 py-5">
            <CardHeader>
              <CardTitle className="text-base">
                {t('proposals.headers.selectedRole')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: selectedServerRole.color }}
                />
                <span className="font-medium">{selectedServerRole.name}</span>
                <span className="text-muted-foreground text-sm">
                  {MIDDOT_WITH_SPACES}
                </span>
                <p className="text-muted-foreground text-sm">
                  {t('roles.labels.membersCount', {
                    count: selectedServerRole.memberCount,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {action === 'change-role' &&
          selectedServerRole &&
          (nameChanged || colorChanged) && (
            <Card className="gap-3 py-5">
              <CardHeader>
                <CardTitle className="text-base">
                  {t('proposals.headers.roleAttributesChanges')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nameChanged && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">
                        {t('proposals.labels.roleNameChange')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground text-sm">
                          {selectedServerRole.name}
                        </span>
                        <span className="text-sm">→</span>
                        <span className="text-sm font-medium">
                          {serverRoleName}
                        </span>
                      </div>
                    </div>
                  )}
                  {colorChanged && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">
                        {t('proposals.labels.roleColorChange')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: selectedServerRole.color }}
                        />
                        <span className="text-muted-foreground text-sm">
                          {selectedServerRole.color}
                        </span>
                        <span className="text-sm">→</span>
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: serverRoleColor }}
                        />
                        <span className="text-sm font-medium">
                          {serverRoleColor}
                        </span>
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
                  {t('proposals.headers.permissions')}
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
                          {getPermissionName(
                            permissionName as ServerPermissionKeys,
                          )}
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
                {t('proposals.headers.memberChanges')}
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
          {t('proposals.actions.create')}
        </Button>
      </div>
    </div>
  );
};
