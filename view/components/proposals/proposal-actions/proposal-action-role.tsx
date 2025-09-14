import { api } from '@/client/api-client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import {
  ProposalActionRoleRes,
  ProposalActionType,
} from '@/types/proposal-action.types';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  role: ProposalActionRoleRes;
  actionType: ProposalActionType;
}

export const ProposalActionRole = ({ role, actionType }: Props) => {
  const [showDetails, setShowDetails] = useState(false);

  const { data: roleData, isLoading: isRoleLoading } = useQuery({
    queryKey: ['role', role.roleId],
    queryFn: () => api.getRole(role.roleId),
    enabled: showDetails,
  });

  const { t } = useTranslation();

  const getAccordionLabel = () => {
    if (actionType === 'change-role') {
      return t('proposals.labels.roleChangeProposal');
    }
    return t('proposals.labels.roleProposal');
  };

  return (
    <Accordion
      value={showDetails ? 'role-change-proposal' : undefined}
      onChange={() => setShowDetails(!showDetails)}
      type="single"
      className="mb-2.5 rounded-md border px-2.5"
      collapsible
    >
      <AccordionItem value="role-change-proposal">
        <AccordionTrigger className="cursor-pointer hover:no-underline">
          {getAccordionLabel()}
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          {isRoleLoading && (
            <div className="text-muted-foreground p-2 text-sm">
              {t('actions.loading')}
            </div>
          )}

          {roleData && (
            <div className="space-y-0.5">
              <div className="text-sm font-medium">
                {t('proposals.headers.selectedRole')}
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: roleData.role.color }}
                />
                <span className="font-medium">{roleData.role.name}</span>
                <span className="text-muted-foreground text-sm">
                  {MIDDOT_WITH_SPACES}
                </span>
                <p className="text-muted-foreground text-sm">
                  {t('roles.labels.membersCount', {
                    count: roleData.role.memberCount,
                  })}
                </p>
              </div>
            </div>
          )}

          {(role.name !== role.prevName || role.color !== role.prevColor) && (
            <div className="space-y-3">
              {role.name !== role.prevName && (
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    {t('proposals.labels.roleNameChange')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground text-sm">
                      {role.prevName}
                    </span>
                    <span className="text-sm">→</span>
                    <span className="text-sm font-medium">{role.name}</span>
                  </div>
                </div>
              )}
              {role.color !== role.prevColor && (
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    {t('proposals.labels.roleColorChange')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: role.prevColor }}
                    />
                    <span className="text-muted-foreground text-sm">
                      {role.prevColor}
                    </span>
                    <span className="text-sm">→</span>
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    <span className="text-sm font-medium">{role.color}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
