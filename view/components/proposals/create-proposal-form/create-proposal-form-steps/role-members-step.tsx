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
} from '../create-proposa-form.types';

export const RoleMembersStep = () => {
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

  const handleNext = () => {
    onNext();
  };

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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('proposals.headers.searchMembers')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder={t('proposals.placeholders.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('proposals.headers.memberChanges')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="max-h-60 space-y-2 overflow-y-auto">
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
        <Button onClick={handleNext}>{t('actions.next')}</Button>
      </div>
    </div>
  );
};
