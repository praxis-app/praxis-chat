import { WizardStepProps } from '@/components/shared/wizard/wizard.types';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RoleMemberOption } from '../../../roles/role-member-option';
import { useWizardContext } from '../../../shared/wizard/wizard-hooks';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';
import {
  CreateProposalFormSchema,
  CreateProposalWizardContext,
} from '../create-proposal-form.types';

export const RoleMembersStep = ({ isLoading }: WizardStepProps) => {
  const {
    context: { selectedRole, usersEligibleForRole },
    onNext,
    onPrevious,
  } = useWizardContext<CreateProposalWizardContext>();

  const [searchTerm, setSearchTerm] = useState('');

  const form = useFormContext<CreateProposalFormSchema>();
  const selectedMembers = form.watch('roleMembers') || [];
  const selectedRoleId = form.watch('selectedRoleId');

  const { t } = useTranslation();

  const setFieldValue = (
    field: keyof CreateProposalFormSchema,
    value: CreateProposalFormSchema[keyof CreateProposalFormSchema],
  ) => {
    form.setValue(field, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleMemberChange = (memberChanges: string[]) => {
    setFieldValue('roleMembers', memberChanges);
  };

  const filteredUsers =
    [...(selectedRole?.members || []), ...(usersEligibleForRole || [])].filter(
      (user) =>
        (user.displayName || user.name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    ) || [];

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
          {t('proposals.headers.roleMembers')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.descriptions.roleMembersDescription')}
        </p>
      </div>

      <div className="space-y-4">
        {selectedRoleId && (
          <>
            <Input
              placeholder={t('proposals.placeholders.searchMembersPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-5"
            />

            <Card className="gap-1.5">
              <CardHeader>
                <CardTitle className="text-base">
                  {t('proposals.headers.memberChanges')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="min-h-48 space-y-0.5">
                  {filteredUsers.map((user) => (
                    <RoleMemberOption
                      key={user.id}
                      user={user}
                      selectedUserIds={selectedMembers}
                      setSelectedUserIds={handleMemberChange}
                    />
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      {t('proposals.prompts.noUsersFound')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          {t('actions.previous')}
        </Button>
        <Button onClick={onNext}>{t('actions.next')}</Button>
      </div>
    </div>
  );
};
