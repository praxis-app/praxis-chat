import { WizardStepProps } from '@/components/shared/wizard/wizard.types';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { getPermissionValuesMap } from '@/lib/role.utils';
import {
  CreateProposalActionRoleMemberReq,
  ProposalActionType,
} from '@/types/proposal-action.types';
import { PermissionKeys } from '@/types/role.types';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '../../../shared/wizard/wizard-hooks';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import {
  CreateProposalFormSchema,
  CreateProposalWizardContext,
} from '../create-proposal-form.types';

export const ProposalReviewStep = ({ isLoading }: WizardStepProps) => {
  const {
    context: { selectedRole, usersEligibleForRole },
    onSubmit,
    onPrevious,
    isSubmitting,
  } = useWizardContext<CreateProposalWizardContext>();

  const form = useFormContext<CreateProposalFormSchema>();

  const formValues = form.getValues();
  const { action, body, permissions, roleMembers, roleName, roleColor } =
    formValues;

  const shapedRolePermissions = getPermissionValuesMap(
    selectedRole?.permissions || [],
  );

  const permissionChanges = Object.entries(permissions || {}).reduce<
    Record<string, boolean>
  >((acc, [permission, value]) => {
    if (value !== shapedRolePermissions[permission]) {
      acc[permission] = value;
    }
    return acc;
  }, {});

  const memberChanges = (() => {
    const memberChanges: CreateProposalActionRoleMemberReq[] = [];
    for (const member of selectedRole?.members || []) {
      if (!roleMembers?.includes(member.id)) {
        memberChanges.push({ userId: member.id, changeType: 'remove' });
      }
    }
    for (const user of usersEligibleForRole || []) {
      if (roleMembers?.includes(user.id)) {
        memberChanges.push({ userId: user.id, changeType: 'add' });
      }
    }
    return memberChanges;
  })();

  const { t } = useTranslation();

  // TODO: Refactor to avoid successive calls to find user in both arrays - build once
  const getMemberName = (userId: string) => {
    const user = [
      ...(usersEligibleForRole || []),
      ...(selectedRole?.members || []),
    ].find((user) => user.id === userId);
    return user?.displayName || user?.name;
  };

  const getProposalActionType = (action: ProposalActionType | '') => {
    if (!action) {
      return '';
    }
    return t(`proposals.actionTypes.${action}`);
  };

  const getPermissionName = (name: PermissionKeys | '') => {
    if (!name) {
      return '';
    }
    return t(`permissions.names.${name}`);
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
            <p className="text-sm">{getProposalActionType(action)}</p>
          </CardContent>
        </Card>

        {action === 'change-role' && selectedRole && (
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
          (roleName !== selectedRole.name ||
            roleColor !== selectedRole.color) && (
            <Card className="gap-3 py-5">
              <CardHeader>
                <CardTitle className="text-base">
                  {t('proposals.headers.roleAttributesChanges')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roleName !== selectedRole.name && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">
                        {t('proposals.labels.roleNameChange')}
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
                  {roleColor !== selectedRole.color && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">
                        {t('proposals.labels.roleColorChange')}
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
                {t('proposals.headers.memberChanges')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {memberChanges.map(
                  (
                    member: CreateProposalActionRoleMemberReq,
                    index: number,
                  ) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="max-w-[150px] truncate text-sm md:max-w-[220px]">
                        {getMemberName(member.userId)}
                      </span>
                      <Badge
                        variant={
                          member.changeType === 'add'
                            ? 'default'
                            : 'destructive'
                        }
                        className="w-16"
                      >
                        {member.changeType === 'add'
                          ? t('actions.add')
                          : t('actions.remove')}
                      </Badge>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          {t('actions.previous')}
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? t('actions.submit') : t('proposals.actions.create')}
        </Button>
      </div>
    </div>
  );
};
