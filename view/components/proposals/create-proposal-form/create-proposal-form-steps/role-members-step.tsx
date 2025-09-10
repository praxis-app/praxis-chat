import { api } from '@/client/api-client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '../../../shared/wizard/wizard-hooks';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { ProposeRoleMemberOption } from '../../proposal-actions/propose-role-member-option';
import { CreateProposalFormSchema } from '../create-proposa-form.types';

export const RoleMembersStep = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { form, onNext, onPrevious } =
    useWizardContext<CreateProposalFormSchema>();

  const roleMembers = form.watch('roleMembers') || [];
  const selectedRoleId = form.watch('selectedRoleId');

  const { t } = useTranslation();

  // Get eligible users for the selected role
  const { data: eligibleUsersData, isLoading: isLoadingEligible } = useQuery({
    queryKey: ['role', selectedRoleId, 'members', 'eligible'],
    queryFn: () => api.getUsersEligibleForRole(selectedRoleId!),
    enabled: !!selectedRoleId,
  });

  // Get current role members
  const { data: roleData, isLoading: isLoadingRole } = useQuery({
    queryKey: ['role', selectedRoleId],
    queryFn: () => api.getRole(selectedRoleId!),
    enabled: !!selectedRoleId,
  });

  const setFieldValue = (
    field: keyof CreateProposalFormSchema,
    value: CreateProposalFormSchema[keyof CreateProposalFormSchema],
  ) => {
    form.setValue(field, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleMemberChange = (
    memberChanges: Array<{ userId: string; changeType: 'add' | 'remove' }>,
  ) => {
    setFieldValue('roleMembers', memberChanges);
  };

  const filteredUsers =
    eligibleUsersData?.users.filter((user) =>
      (user.displayName || user.name)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ) || [];

  const currentRoleMembers = roleData?.role.members || [];

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('proposals.wizard.roleMembers')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.wizard.roleMembersDescription')}
        </p>
      </div>

      <div className="space-y-4">
        {selectedRoleId && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('proposals.wizard.searchMembers')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder={t('proposals.wizard.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('proposals.wizard.memberChanges')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoadingEligible || isLoadingRole ? (
                  <p className="text-muted-foreground text-sm">
                    {t('actions.loading')}
                  </p>
                ) : (
                  <div className="max-h-60 space-y-2 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <ProposeRoleMemberOption
                        key={user.id}
                        member={user}
                        selectedMembers={roleMembers}
                        setSelectedMembers={handleMemberChange}
                        currentRoleMembers={currentRoleMembers}
                      />
                    ))}
                    {filteredUsers.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        {t('proposals.wizard.noUsersFound')}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          {t('actions.previous')}
        </Button>
        <Button onClick={handleNext}>{t('actions.next')}</Button>
      </div>
    </div>
  );
};
