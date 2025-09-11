import { api } from '@/client/api-client';
import { getPermissionValues } from '@/lib/role.utils';
import {
  CreateProposalActionRoleMemberReq,
  ProposalActionType,
} from '@/types/proposal.types';
import { PermissionKeys } from '@/types/role.types';
import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '../../../shared/wizard/wizard-hooks';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { CreateProposalFormSchema } from '../create-proposa-form.types';

export const ProposalReviewStep = () => {
  const form = useFormContext<CreateProposalFormSchema>();
  const { onSubmit, onPrevious, isSubmitting } = useWizardContext();

  const formValues = form.getValues();
  const { action, body, permissions, roleMembers, selectedRoleId } = formValues;

  const { data: roleData } = useQuery({
    queryKey: ['role', selectedRoleId],
    queryFn: () => api.getRole(selectedRoleId!),
    enabled: !!selectedRoleId,
  });

  const shapedRolePermissions = getPermissionValues(
    roleData?.role.permissions || [],
  ).reduce<Record<string, boolean>>((acc, permission) => {
    acc[permission.name] = permission.value;
    return acc;
  }, {});

  const changedPermissions = Object.entries(permissions || {}).reduce<
    Record<string, boolean>
  >((acc, [permission, value]) => {
    if (value !== shapedRolePermissions[permission]) {
      acc[permission] = value;
    }
    return acc;
  }, {});

  const { t } = useTranslation();

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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('proposals.wizard.review')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.wizard.reviewDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('proposals.labels.actionType')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{getProposalActionType(action)}</Badge>
          </CardContent>
        </Card>

        {body && (
          <Card>
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

        {action === 'change-role' &&
          Object.keys(changedPermissions).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('proposals.wizard.permissions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(changedPermissions).map(
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

        {action === 'change-role' && selectedRoleId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('proposals.wizard.selectedRole')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{selectedRoleId}</p>
            </CardContent>
          </Card>
        )}

        {action === 'change-role' && roleMembers && roleMembers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('proposals.wizard.memberChanges')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roleMembers.map(
                  (
                    member: CreateProposalActionRoleMemberReq,
                    index: number,
                  ) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">User ID: {member.userId}</span>
                      <Badge
                        variant={
                          member.changeType === 'add'
                            ? 'default'
                            : 'destructive'
                        }
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
