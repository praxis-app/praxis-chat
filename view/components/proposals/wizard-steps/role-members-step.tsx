import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/client/api-client';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { ProposeRoleMemberOption } from '../../proposal-actions/propose-role-member-option';
import { useWizardContext } from '../wizard-hooks';

interface ProposalFormData {
  body: string;
  action: '' | 'change-role' | 'change-settings' | 'create-role' | 'plan-event' | 'test';
  permissions?: Record<string, boolean>;
  roleMembers?: Array<{ userId: string; changeType: 'add' | 'remove' }>;
  selectedRoleId?: string;
}

interface RoleMembersStepProps {
  stepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const RoleMembersStep = (_props: RoleMembersStepProps) => {
  const { t } = useTranslation();
  const { form, onNext, onPrevious } = useWizardContext();
  const [searchTerm, setSearchTerm] = useState('');

  const formValues = form.getValues();
  const roleMembers = formValues.roleMembers || [];
  const selectedRoleId = formValues.selectedRoleId;

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

  const setFieldValue = (field: string, value: unknown) => {
    form.setValue(field as keyof ProposalFormData, value as never);
  };

  const handleMemberChange = (memberChanges: Array<{ userId: string; changeType: 'add' | 'remove' }>) => {
    setFieldValue('roleMembers', memberChanges);
  };

  const filteredUsers = eligibleUsersData?.users.filter((user) =>
    (user.displayName || user.name).toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const currentRoleMembers = roleData?.role.members || [];

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t('proposals.wizard.roleMembers')}</h2>
        <p className="text-sm text-muted-foreground">
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
                  <p className="text-sm text-muted-foreground">
                    {t('actions.loading')}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
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
                      <p className="text-sm text-muted-foreground">
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
        <Button onClick={handleNext}>
          {t('actions.next')}
        </Button>
      </div>
    </div>
  );
};