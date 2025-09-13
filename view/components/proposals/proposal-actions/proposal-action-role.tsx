import { ProposalActionRoleRes } from '@/types/proposal-action.types';
import { useTranslation } from 'react-i18next';

interface Props {
  role: ProposalActionRoleRes;
}

export const ProposalActionRole = ({ role }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="mb-2.5">
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
    </div>
  );
};
