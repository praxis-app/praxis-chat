import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ProposalActionRoleRes,
  ProposalActionType,
} from '@/types/proposal-action.types';
import { useTranslation } from 'react-i18next';

interface Props {
  role: ProposalActionRoleRes;
  actionType: ProposalActionType;
}

export const ProposalActionRole = ({ role, actionType }: Props) => {
  const { t } = useTranslation();

  const getAccordionLabel = () => {
    if (actionType === 'change-role') {
      return t('proposals.labels.roleChangeProposal');
    }
    return t('proposals.labels.roleProposal');
  };

  return (
    <Accordion
      type="single"
      className="mb-2.5 rounded-md border px-2.5"
      collapsible
    >
      <AccordionItem value="role-change-proposal">
        <AccordionTrigger className="cursor-pointer hover:no-underline">
          {getAccordionLabel()}
        </AccordionTrigger>
        <AccordionContent>
          {(role.name !== role.prevName || role.color !== role.prevColor) && (
            <div className="space-y-3">
              {role.name !== role.prevName && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">
                    {t('proposals.labels.roleNameChange')}
                  </span>
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
                <div className="space-y-1">
                  <span className="text-sm font-medium">
                    {t('proposals.labels.roleColorChange')}
                  </span>
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
