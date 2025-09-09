import { useTranslation } from 'react-i18next';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ProposalFormData, useWizardContext } from '../wizard-hooks';

interface ReviewStepProps {
  stepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const ReviewStep = (_props: ReviewStepProps) => {
  const { t } = useTranslation();
  const { form, onSubmit, onPrevious, isSubmitting } =
    useWizardContext<ProposalFormData>();

  const formValues = form.getValues();
  const { action, body, permissions, roleMembers, selectedRoleId } = formValues;

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
            <Badge variant="secondary">
              {t(`proposals.actionTypes.${action}` as never)}
            </Badge>
          </CardContent>
        </Card>

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

        {action === 'change-role' && permissions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('proposals.wizard.permissions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(permissions).map(([key, value]) => {
                  if (value === undefined) {
                    return null;
                  }
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">
                        {t(`permissions.names.${key}` as never)}
                      </span>
                      <Badge variant={value ? 'default' : 'destructive'}>
                        {value ? t('actions.enabled') : t('actions.disabled')}
                      </Badge>
                    </div>
                  );
                })}
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
                    member: { userId: string; changeType: 'add' | 'remove' },
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
                          ? t('actions.add' as never)
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
